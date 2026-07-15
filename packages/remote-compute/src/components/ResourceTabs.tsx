import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { computeApi } from '../data/computeApi';
import type { TFunction } from '../i18n';
import { StatusBadge } from './StatusBadge';
import { LoadingRows, ErrorState, EmptyState } from './states';

type Tab = 'hypervisors' | 'flavors';

const toGib = (mb: number) => Math.round(mb / 1024);

/** Hypervisors table — its own `['hypervisors']` query; cached across tab switches. */
function HypervisorsTable({ t }: { t: TFunction }) {
  const q = useQuery({ queryKey: ['hypervisors'], queryFn: computeApi.listHypervisors });
  if (q.isPending) return <LoadingRows rows={3} />;
  if (q.isError) return <ErrorState onRetry={() => q.refetch()} t={t} />;
  if (q.data.length === 0) return <EmptyState t={t} />;

  return (
    <table className="w-full text-left text-xs">
      <thead className="bg-sunken text-2xs uppercase tracking-wider text-muted">
        <tr>
          <th className="px-3 py-1.5 font-semibold">{t('colName')}</th>
          <th className="px-3 py-1.5 font-semibold">{t('colState')}</th>
          <th className="px-3 py-1.5 font-semibold">{t('colAdmin')}</th>
          <th className="px-3 py-1.5 font-semibold">{t('colVcpus')}</th>
          <th className="px-3 py-1.5 font-semibold">{t('colMemory')}</th>
          <th className="px-3 py-1.5 font-semibold">{t('colVms')}</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-line">
        {q.data.map((h) => (
          <tr key={h.id} className="text-body">
            <td className="px-3 py-1.5 font-medium">{h.hostname}</td>
            <td className="px-3 py-1.5">
              <StatusBadge status={h.state} />
            </td>
            <td className="px-3 py-1.5">
              <StatusBadge status={h.status} />
            </td>
            <td className="px-3 py-1.5 font-mono tabular-nums">
              {h.vcpusUsed}/{h.vcpus}
            </td>
            <td className="px-3 py-1.5 font-mono tabular-nums">
              {toGib(h.memoryMbUsed)}/{toGib(h.memoryMb)} GiB
            </td>
            <td className="px-3 py-1.5 font-mono tabular-nums">{h.runningVms}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** Flavors table — its own `['flavors']` query (shared with the detail panel). */
function FlavorsTable({ t }: { t: TFunction }) {
  const q = useQuery({ queryKey: ['flavors'], queryFn: computeApi.listFlavors });
  if (q.isPending) return <LoadingRows rows={3} />;
  if (q.isError) return <ErrorState onRetry={() => q.refetch()} t={t} />;
  if (q.data.length === 0) return <EmptyState t={t} />;

  return (
    <table className="w-full text-left text-xs">
      <thead className="bg-sunken text-2xs uppercase tracking-wider text-muted">
        <tr>
          <th className="px-3 py-1.5 font-semibold">{t('colName')}</th>
          <th className="px-3 py-1.5 font-semibold">{t('colVcpus')}</th>
          <th className="px-3 py-1.5 font-semibold">{t('colRam')}</th>
          <th className="px-3 py-1.5 font-semibold">{t('colDisk')}</th>
          <th className="px-3 py-1.5 font-semibold">{t('colPublic')}</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-line">
        {q.data.map((f) => (
          <tr key={f.id} className="text-body">
            <td className="px-3 py-1.5 font-mono font-medium">{f.name}</td>
            <td className="px-3 py-1.5 font-mono tabular-nums">{f.vcpus}</td>
            <td className="px-3 py-1.5 font-mono tabular-nums">{toGib(f.ramMb)} GiB</td>
            <td className="px-3 py-1.5 font-mono tabular-nums">{f.diskGb} GiB</td>
            <td className="px-3 py-1.5">{f.isPublic ? '✓' : '—'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** Bottom tabbed panel (hypervisors / flavors). */
export function ResourceTabs({ t }: { t: TFunction }) {
  const [tab, setTab] = useState<Tab>('hypervisors');

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
        {tabBtn('hypervisors', t('tabHypervisors'))}
        {tabBtn('flavors', t('tabFlavors'))}
      </div>
      <div className="max-h-44 overflow-auto">
        {tab === 'hypervisors' ? <HypervisorsTable t={t} /> : <FlavorsTable t={t} />}
      </div>
    </div>
  );
}
