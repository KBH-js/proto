import { Network, Router, Globe, Cable } from 'lucide-react';
import type { NetworkSummary } from '../data/types';
import type { TFunction } from '../i18n';
import { StatusBadge } from './StatusBadge';

/** Top KPI row — driven by the `['summary']` query. */
export function SummaryCards({ summary, t }: { summary: NetworkSummary; t: TFunction }) {
  const cards = [
    { icon: Network, label: t('sumNetworks'), value: summary.networks, sub: `${summary.activeNetworks} ${t('sumActive')}` },
    { icon: Router, label: t('sumRouters'), value: summary.routers, sub: undefined },
    { icon: Globe, label: t('sumFloatingIps'), value: summary.floatingIps, sub: `${summary.floatingIpsInUse} ${t('sumInUse')}` },
    { icon: Cable, label: t('sumPorts'), value: summary.ports, sub: undefined },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
      {cards.map((c) => (
        <div key={c.label} className="rounded-xl border border-line bg-surface px-3 py-2.5">
          <div className="flex items-center gap-1.5 text-muted">
            <c.icon className="h-3.5 w-3.5" />
            <span className="text-2xs font-semibold uppercase tracking-wider">{c.label}</span>
          </div>
          <p className="mt-0.5 text-xl font-bold tabular-nums text-body">{c.value}</p>
          {c.sub && <p className="text-2xs text-faint">{c.sub}</p>}
        </div>
      ))}

      <div className="rounded-xl border border-line bg-surface px-3 py-2.5">
        <div className="flex items-center gap-1.5 text-muted">
          <span className="text-2xs font-semibold uppercase tracking-wider">{t('sumHealth')}</span>
        </div>
        <div className="mt-1.5">
          <StatusBadge status={summary.health} label={t(summary.health)} />
        </div>
      </div>
    </div>
  );
}
