import type {
  NetworkStatus,
  RouterStatus,
  FloatingIpStatus,
  PortStatus,
  Health,
} from '../data/types';

type AnyStatus = NetworkStatus | RouterStatus | FloatingIpStatus | PortStatus | Health;

// Token-class tones only (no raw color) — resolved from the scoped CSS vars.
const TONE: Record<string, string> = {
  ACTIVE: 'bg-ok/15 text-ok',
  healthy: 'bg-ok/15 text-ok',
  BUILD: 'bg-warn/15 text-warn',
  degraded: 'bg-warn/15 text-warn',
  DOWN: 'bg-faint/20 text-muted',
  ERROR: 'bg-danger/15 text-danger',
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
