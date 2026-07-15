import type {
  ServerStatus,
  PowerState,
  HypervisorState,
  HypervisorStatus,
  VolumeStatus,
  Health,
} from '../data/types';

type AnyStatus =
  | ServerStatus
  | PowerState
  | HypervisorState
  | HypervisorStatus
  | VolumeStatus
  | Health;

// Token-class tones only (no raw color) — resolved from the scoped CSS vars.
const TONE: Record<string, string> = {
  ACTIVE: 'bg-ok/15 text-ok',
  RUNNING: 'bg-ok/15 text-ok',
  up: 'bg-ok/15 text-ok',
  enabled: 'bg-ok/15 text-ok',
  'in-use': 'bg-ok/15 text-ok',
  healthy: 'bg-ok/15 text-ok',
  BUILD: 'bg-warn/15 text-warn',
  RESIZE: 'bg-warn/15 text-warn',
  disabled: 'bg-warn/15 text-warn',
  degraded: 'bg-warn/15 text-warn',
  SHUTOFF: 'bg-faint/20 text-muted',
  SHUTDOWN: 'bg-faint/20 text-muted',
  PAUSED: 'bg-faint/20 text-muted',
  SHELVED: 'bg-faint/20 text-muted',
  NOSTATE: 'bg-faint/20 text-muted',
  available: 'bg-faint/20 text-muted',
  ERROR: 'bg-danger/15 text-danger',
  CRASHED: 'bg-danger/15 text-danger',
  down: 'bg-danger/15 text-danger',
  error: 'bg-danger/15 text-danger',
  critical: 'bg-danger/15 text-danger',
};

export function StatusBadge({ status, label }: { status: AnyStatus; label?: string }) {
  const tone = TONE[status] ?? 'bg-faint/20 text-muted';
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-2xs font-semibold uppercase tracking-wide ${tone}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label ?? status}
    </span>
  );
}
