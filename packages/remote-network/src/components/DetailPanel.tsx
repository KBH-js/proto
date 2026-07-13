import { useQuery } from '@tanstack/react-query';
import { networkApi } from '../data/networkApi';
import type { NeutronNetwork } from '../data/types';
import type { TFunction } from '../i18n';
import { StatusBadge } from './StatusBadge';
import { LoadingRows, ErrorState, EmptyState } from './states';

/**
 * Detail for the selected network: metadata, its subnets, and its ports.
 * Ports come from their own `['ports', id]` query — switching networks refetches
 * only the ports (summary/networks stay cached), and revisiting a network is
 * instant from cache.
 */
export function DetailPanel({ network, t }: { network: NeutronNetwork | null; t: TFunction }) {
  const portsQ = useQuery({
    queryKey: ['ports', network?.id],
    queryFn: () => networkApi.listPorts(network!.id),
    enabled: !!network,
  });

  if (!network) {
    return (
      <div className="grid h-full place-items-center p-6 text-center text-sm text-muted">
        {t('selectPrompt')}
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-line px-3 py-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-semibold text-body">{network.name}</span>
            <StatusBadge status={network.status} />
          </div>
          <span className="font-mono text-2xs text-muted">
            {network.tenant} · {t('mtu')} {network.mtu}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-3 space-y-4">
        {/* Subnets */}
        <section>
          <h3 className="mb-1.5 text-2xs font-semibold uppercase tracking-wider text-muted">
            {t('detailSubnets')}
          </h3>
          {network.subnets.length === 0 ? (
            <p className="text-xs text-faint">{t('empty')}</p>
          ) : (
            <div className="overflow-hidden rounded-lg border border-line">
              <table className="w-full text-left text-xs">
                <thead className="bg-sunken text-2xs uppercase tracking-wider text-muted">
                  <tr>
                    <th className="px-2 py-1.5 font-semibold">{t('colName')}</th>
                    <th className="px-2 py-1.5 font-semibold">{t('colCidr')}</th>
                    <th className="px-2 py-1.5 font-semibold">{t('colGateway')}</th>
                    <th className="px-2 py-1.5 font-semibold">{t('dhcpOn')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {network.subnets.map((s) => (
                    <tr key={s.id} className="text-body">
                      <td className="px-2 py-1.5">{s.name}</td>
                      <td className="px-2 py-1.5 font-mono">{s.cidr}</td>
                      <td className="px-2 py-1.5 font-mono">{s.gatewayIp}</td>
                      <td className="px-2 py-1.5">{s.enableDhcp ? '✓' : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Ports */}
        <section>
          <h3 className="mb-1.5 text-2xs font-semibold uppercase tracking-wider text-muted">
            {t('detailPorts')}
          </h3>
          {portsQ.isPending ? (
            <LoadingRows rows={3} />
          ) : portsQ.isError ? (
            <ErrorState onRetry={() => portsQ.refetch()} t={t} />
          ) : portsQ.data.length === 0 ? (
            <EmptyState t={t} />
          ) : (
            <div className="overflow-hidden rounded-lg border border-line">
              <table className="w-full text-left text-xs">
                <thead className="bg-sunken text-2xs uppercase tracking-wider text-muted">
                  <tr>
                    <th className="px-2 py-1.5 font-semibold">{t('colOwner')}</th>
                    <th className="px-2 py-1.5 font-semibold">{t('colMac')}</th>
                    <th className="px-2 py-1.5 font-semibold">{t('colFixedIps')}</th>
                    <th className="px-2 py-1.5 font-semibold">{t('colStatus')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {portsQ.data.map((p) => (
                    <tr key={p.id} className="text-body">
                      <td className="px-2 py-1.5 font-mono">{p.deviceOwner}</td>
                      <td className="px-2 py-1.5 font-mono">{p.macAddress}</td>
                      <td className="px-2 py-1.5 font-mono">{p.fixedIps.join(', ') || '—'}</td>
                      <td className="px-2 py-1.5">
                        <StatusBadge status={p.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
