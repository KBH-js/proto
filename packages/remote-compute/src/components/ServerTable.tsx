import type { Server } from '../data/types';
import type { TFunction } from '../i18n';
import { StatusBadge } from './StatusBadge';

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded bg-accent-soft px-1.5 py-0.5 text-2xs font-medium text-accent">
      {children}
    </span>
  );
}

/** Master list of instances — selectable rows drive the detail panel. */
export function ServerTable({
  servers,
  selectedId,
  onSelect,
  t,
}: {
  servers: Server[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  t: TFunction;
}) {
  return (
    <ul className="divide-y divide-line">
      {servers.map((s) => (
        <li key={s.id}>
          <button
            onClick={() => onSelect(s.id)}
            className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-left transition-colors hover:bg-sunken ${
              selectedId === s.id ? 'bg-accent-soft' : ''
            }`}
          >
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="truncate text-sm font-medium text-body">{s.name}</span>
                {s.locked && <Tag>{t('tagLocked')}</Tag>}
              </div>
              <div className="truncate font-mono text-2xs text-muted">
                {s.tenant} · {s.imageName}
              </div>
            </div>
            <StatusBadge status={s.status} />
          </button>
        </li>
      ))}
    </ul>
  );
}
