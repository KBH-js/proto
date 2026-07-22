import { registerRemotes, loadRemote } from '@module-federation/enhanced/runtime';
import type { ComponentType } from 'react';
import { useFederationStore } from '../store/federationStore';

/**
 * Module Federation Runtime Helpers
 *
 * The host build declares NO remotes — the MF rsbuild plugin only creates
 * the federation instance and the shared scope (react/react-dom).
 * These helpers register and load remotes dynamically at runtime, which is
 * what enables:
 *   - remote URLs injected from a manifest instead of build-time env vars
 *   - per-window retry after a failed load (force re-registration)
 */

export interface RemoteRegistration {
  /** MF container name, e.g. 'remoteNetwork' */
  name: string;
  /** Entry URL — the remote's mf-manifest.json (or remoteEntry.js) */
  entry: string;
}

/**
 * Register remotes with the MF runtime instance created by the build plugin.
 * Safe to call once at boot with the full list from the app catalog.
 */
export function registerAppRemotes(remotes: RemoteRegistration[]): void {
  registerRemotes(remotes);
  const { markRegistered } = useFederationStore.getState();
  for (const remote of remotes) markRegistered(remote.name, remote.entry);
}

/**
 * Re-register a single remote, discarding its cached container/snapshot.
 *
 * Used by the per-window retry flow: after a failed load the MF runtime
 * caches the failure, so a plain re-import would reject again. Forcing the
 * registration resets that cache. Already-mounted instances of the same
 * remote keep working — their module code is already executing in the
 * React tree; only subsequent loadRemote calls hit the fresh container.
 */
export function forceRefreshRemote(remote: RemoteRegistration): void {
  registerRemotes([remote], { force: true });
  useFederationStore.getState().markRegistered(remote.name, remote.entry);
}

/**
 * Load a remote module and normalize it into a lazy()-compatible shape.
 *
 * @param id - Federated module id, e.g. 'remoteNetwork/NetworkApp'
 * @throws when the module cannot be loaded or has no component default export —
 *         the rejection propagates through React.lazy into the ErrorBoundary.
 */
export async function loadRemoteComponent<P = object>(
  id: string,
): Promise<{ default: ComponentType<P> }> {
  // Container name is the first segment of 'name/Module'. This is the single
  // choke-point every remote load passes through, so it's where we measure
  // the true fetch+eval duration and record success/failure for the Inspector.
  const name = id.split('/')[0];
  const { markLoading, markLoaded, markError } = useFederationStore.getState();
  markLoading(name);
  const start = performance.now();
  try {
    const mod = await loadRemote<{ default: ComponentType<P> }>(id);
    if (!mod || typeof mod.default !== 'function') {
      throw new Error(`Remote module '${id}' did not resolve to a React component`);
    }
    markLoaded(name, Math.round(performance.now() - start));
    return { default: mod.default };
  } catch (error) {
    markError(name, error instanceof Error ? error.message : String(error));
    throw error;
  }
}
