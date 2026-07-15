import { useState } from 'react';
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { Server as ServerIcon, RefreshCw, Zap } from 'lucide-react';
// CSS must be imported by the exposed module so its styles (and the scoped
// design tokens) are injected when the host loads this app via MF.
import './index.css';
import { computeApi } from './data/computeApi';
import { setOutage, isOutage } from './data/db';
import { useT } from './i18n';
import { SummaryCards } from './components/SummaryCards';
import { ServerTable } from './components/ServerTable';
import { DetailPanel } from './components/DetailPanel';
import { ResourceTabs } from './components/ResourceTabs';
import { LoadingRows, ErrorState } from './components/states';

// Remote-internal QueryClient — NOT shared with the host. Each remote owns its
// own cache; only react/react-dom are negotiated as MF singletons.
const queryClient = new QueryClient({
  defaultOptions: {
    // retry:0 — a simulated outage is persistent, so retrying is pointless and
    // only delays the error state. staleTime keeps data cached across views.
    queries: { staleTime: 30_000, retry: 0, refetchOnWindowFocus: false },
  },
});

/**
 * Compute dashboard remote (OpenStack Nova narrative).
 *
 * Demonstrates a realistic REST UI over TanStack Query: per-resource queries
 * with independent loading/error states, cross-view caching, and a
 * "Simulate outage" toggle that arms failures to show error → retry → recovery.
 */
export default function ComputeApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <Dashboard />
    </QueryClientProvider>
  );
}

function Dashboard() {
  const { t } = useT();
  const qc = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [outage, setOutageState] = useState(isOutage());

  const summaryQ = useQuery({ queryKey: ['summary'], queryFn: computeApi.getSummary });
  const serversQ = useQuery({ queryKey: ['servers'], queryFn: computeApi.listServers });

  const toggleOutage = () => {
    const next = !outage;
    setOutage(next);
    setOutageState(next);
    // Reset (not just invalidate) so a FRESH fetch runs: armed → loading → error,
    // disarmed → loading → data. invalidate would keep the stale data on failure,
    // hiding the error state.
    qc.resetQueries();
  };
  const refresh = () => qc.invalidateQueries();

  const servers = serversQ.data ?? [];
  const selected = servers.find((s) => s.id === selectedId) ?? null;

  return (
    <div className="remote-compute flex h-full w-full flex-col overflow-hidden bg-surface font-sans text-body">
      {/* Toolbar */}
      <header className="flex items-center justify-between gap-3 border-b border-line bg-panel px-4 py-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-accent/15 text-accent">
            <ServerIcon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-sm font-bold text-body">{t('title')}</h1>
            <p className="truncate text-2xs text-muted">{t('subtitle')}</p>
          </div>
        </div>
        <div className="flex flex-shrink-0 items-center gap-1.5">
          <button
            onClick={refresh}
            className="inline-flex items-center gap-1.5 rounded-md bg-sunken px-2.5 py-1.5 text-xs font-medium text-body transition-colors hover:bg-line"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            {t('refresh')}
          </button>
          <button
            onClick={toggleOutage}
            className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
              outage ? 'bg-danger/15 text-danger' : 'bg-sunken text-muted hover:bg-line'
            }`}
          >
            <Zap className="h-3.5 w-3.5" />
            {outage ? t('outageArmed') : t('simulateOutage')}
          </button>
        </div>
      </header>

      {/* Summary KPIs */}
      <div className="px-4 pt-3">
        {summaryQ.isPending ? (
          <LoadingRows rows={1} />
        ) : summaryQ.isError ? (
          <div className="rounded-lg bg-danger/10 px-3 py-2 text-xs text-danger">
            {t('errorTitle')}
          </div>
        ) : (
          <SummaryCards summary={summaryQ.data} t={t} />
        )}
      </div>

      {/* Master–detail */}
      <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] gap-3 p-4">
        <section className="flex flex-col overflow-hidden rounded-xl border border-line bg-panel">
          <div className="border-b border-line px-3 py-2 text-2xs font-semibold uppercase tracking-wider text-muted">
            {t('sumInstances')}
          </div>
          <div className="flex-1 overflow-auto">
            {serversQ.isPending ? (
              <LoadingRows />
            ) : serversQ.isError ? (
              <ErrorState onRetry={() => serversQ.refetch()} t={t} />
            ) : (
              <ServerTable
                servers={servers}
                selectedId={selectedId}
                onSelect={setSelectedId}
                t={t}
              />
            )}
          </div>
        </section>

        <section className="flex flex-col overflow-hidden rounded-xl border border-line bg-panel">
          <DetailPanel server={selected} t={t} />
        </section>
      </div>

      {/* Hypervisors / Flavors */}
      <div className="px-4 pb-4">
        <ResourceTabs t={t} />
      </div>
    </div>
  );
}
