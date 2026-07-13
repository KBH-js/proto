import type { NeutronNetwork } from '../data/types';
import type { TFunction } from '../i18n';
import { StatusBadge } from './StatusBadge';

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded bg-accent-soft px-1.5 py-0.5 text-2xs font-medium text-accent">
      {children}
    </span>
  );
}

/** Master list of networks — selectable rows drive the detail panel. */
export function NetworkTable({
  networks,
  selectedId,
  onSelect,
  t,
}: {
  networks: NeutronNetwork[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  t: TFunction;
}) {
  return (
    <ul className="divide-y divide-line">
      {networks.map((n) => (
        <li key={n.id}>
          <button
            onClick={() => onSelect(n.id)}
            className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-left transition-colors hover:bg-sunken ${
              selectedId === n.id ? 'bg-accent-soft' : ''
            }`}
          >
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="truncate text-sm font-medium text-body">{n.name}</span>
                {n.external && <Tag>{t('typeExternal')}</Tag>}
                {n.shared && !n.external && <Tag>{t('typeShared')}</Tag>}
              </div>
              <div className="truncate font-mono text-2xs text-muted">
                {n.tenant} · {n.subnets.length} {t('colSubnets')}
              </div>
            </div>
            <StatusBadge status={n.status} />
          </button>
        </li>
      ))}
    </ul>
  );
}
