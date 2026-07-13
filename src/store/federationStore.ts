import { create } from 'zustand';

/**
 * Module Federation telemetry — makes the runtime state of each remote
 * observable so the Federation Inspector can render it. The MF runtime
 * itself exposes no reactive surface; `runtime.ts` funnels every register/
 * load/failure through these actions so the Inspector reflects reality.
 *
 * Not persisted — it's live runtime state, meaningless across reloads.
 */
export type RemoteStatus = 'registered' | 'loading' | 'loaded' | 'error' | 'chaos';

/** Where a remote's entry URL points, derived from the URL itself */
export type ResolvedFrom = 'dev' | 'prod' | 'chaos';

export interface RemoteTelemetry {
  name: string;
  entry: string;
  resolvedFrom: ResolvedFrom;
  status: RemoteStatus;
  /** Duration of the most recent successful load, ms */
  lastLoadMs?: number;
  /** Message from the most recent failed load */
  error?: string;
  /** How many times this remote has finished loading a window */
  loadCount: number;
}

interface FederationState {
  remotes: Record<string, RemoteTelemetry>;
  markRegistered: (name: string, entry: string) => void;
  markLoading: (name: string) => void;
  markLoaded: (name: string, ms: number) => void;
  markError: (name: string, message: string) => void;
  markChaos: (name: string) => void;
}

function resolvedFromEntry(entry: string): ResolvedFrom {
  return entry.includes('localhost') || entry.includes('127.0.0.1') ? 'dev' : 'prod';
}

/** Upsert one remote's telemetry, preserving fields the patch doesn't set. */
function patch(
  state: FederationState,
  name: string,
  next: Partial<RemoteTelemetry>,
): Pick<FederationState, 'remotes'> {
  const prev: RemoteTelemetry =
    state.remotes[name] ??
    { name, entry: '', resolvedFrom: 'prod', status: 'registered', loadCount: 0 };
  return { remotes: { ...state.remotes, [name]: { ...prev, ...next } } };
}

export const useFederationStore = create<FederationState>((set) => ({
  remotes: {},
  markRegistered: (name, entry) =>
    set((s) =>
      patch(s, name, {
        entry,
        resolvedFrom: resolvedFromEntry(entry),
        status: 'registered',
        error: undefined,
      }),
    ),
  markLoading: (name) => set((s) => patch(s, name, { status: 'loading' })),
  markLoaded: (name, ms) =>
    set((s) =>
      patch(s, name, {
        status: 'loaded',
        lastLoadMs: ms,
        error: undefined,
        loadCount: (s.remotes[name]?.loadCount ?? 0) + 1,
      }),
    ),
  markError: (name, message) => set((s) => patch(s, name, { status: 'error', error: message })),
  markChaos: (name) => set((s) => patch(s, name, { status: 'chaos', resolvedFrom: 'chaos' })),
}));
