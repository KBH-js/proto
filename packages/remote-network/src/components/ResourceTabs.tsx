import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { networkApi } from '../data/networkApi';
import type { TFunction } from '../i18n';
import { StatusBadge } from './StatusBadge';
import { LoadingRows, ErrorState, EmptyState } from './states';

type Tab = 'routers' | 'fips';

/** Routers table — its own `['routers']` query; cached across tab switches. */
function RoutersTable({ t }: { t: TFunction }) {
  const q = useQuery({ queryKey: ['routers'], queryFn: networkApi.listRouters });
  if (q.isPending) return <LoadingRows rows={3} />;
  if (q.isError) return <ErrorState onRetry={() => q.refetch()} t={t} />;
  if (q.data.length === 0) return <EmptyState t={t} />;

  return (
    <table className="w-full text-left text-xs">
      <thead className="bg-sunken text-2xs uppercase tracking-wider text-muted">
        <tr>
          <th className="px-3 py-1.5 font-semibold">{t('colName')}</th>
          <th className="px-3 py-1.5 font-semibold">{t('colStatus')}</th>
          <th className="px-3 py-1.5 font-semibold">{t('colHa')}</th>
          <th className="px-3 py-1.5 font-semibold">{t('colExtGateway')}</th>
          <th className="px-3 py-1.5 font-semibold">{t('tenant')}</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-line">
        {q.data.map((r) => (
          <tr key={r.id} className="text-body">
            <td className="px-3 py-1.5 font-medium">{r.name}</td>
            <td className="px-3 py-1.5">
              <StatusBadge status={r.status} />
            </td>
            <td className="px-3 py-1.5">{r.ha ? '✓' : '—'}</td>
            <td className="px-3 py-1.5 font-mono">{r.externalGateway ?? '—'}</td>
            <td className="px-3 py-1.5 font-mono text-muted">{r.tenant}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** Floating IPs table — its own `['floatingIps']` query. */
function FloatingIpsTable({ t }: { t: TFunction }) {
  const q = useQuery({ queryKey: ['floatingIps'], queryFn: networkApi.listFloatingIps });
  if (q.isPending) return <LoadingRows rows={3} />;
  if (q.isError) return <ErrorState onRetry={() => q.refetch()} t={t} />;
  if (q.data.length === 0) return <EmptyState t={t} />;

  return (
    <table className="w-full text-left text-xs">
      <thead className="bg-sunken text-2xs uppercase tracking-wider text-muted">
        <tr>
          <th className="px-3 py-1.5 font-semibold">{t('colFloatingIp')}</th>
          <th className="px-3 py-1.5 font-semibold">{t('colFixedIp')}</th>
          <th className="px-3 py-1.5 font-semibold">{t('colStatus')}</th>
          <th className="px-3 py-1.5 font-semibold">{t('tenant')}</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-line">
        {q.data.map((f) => (
          <tr key={f.id} className="text-body">
            <td className="px-3 py-1.5 font-mono">{f.floatingIp}</td>
            <td className="px-3 py-1.5 font-mono">
              {f.fixedIp ?? <span className="text-faint">{t('unassociated')}</span>}
            </td>
            <td className="px-3 py-1.5">
              <StatusBadge status={f.status} />
            </td>
            <td className="px-3 py-1.5 font-mono text-muted">{f.tenant}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** Bottom tabbed panel (routers / floating IPs). */
export function ResourceTabs({ t }: { t: TFunction }) {
  const [tab, setTab] = useState<Tab>('routers');

  const tabBtn = (id: Tab, label: string) => (
    <button
      onClick={() => setTab(id)}
      className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
        tab === id ? 'bg-accent-soft text-accent' : 'text-muted hover:bg-sunken'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="rounded-xl border border-line bg-panel">
      <div className="flex items-center gap-1 border-b border-line px-2 py-1.5">
        {tabBtn('routers', t('tabRouters'))}
        {tabBtn('fips', t('tabFloatingIps'))}
      </div>
      <div className="max-h-44 overflow-auto">
        {tab === 'routers' ? <RoutersTable t={t} /> : <FloatingIpsTable t={t} />}
      </div>
    </div>
  );
}
