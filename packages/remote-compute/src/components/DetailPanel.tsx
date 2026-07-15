import { useQuery } from '@tanstack/react-query';
import { computeApi } from '../data/computeApi';
import type { Server } from '../data/types';
import type { TFunction } from '../i18n';
import { StatusBadge } from './StatusBadge';
import { LoadingRows, ErrorState, EmptyState } from './states';

/**
 * Detail for the selected instance: spec, its addresses, and its volume
 * attachments. Volumes come from their own `['volumes', id]` query — switching
 * instances refetches only the volumes (summary/servers stay cached), and
 * revisiting an instance is instant from cache. Flavors share the `['flavors']`
 * cache with the bottom tab.
 */
export function DetailPanel({ server, t }: { server: Server | null; t: TFunction }) {
  const volumesQ = useQuery({
    queryKey: ['volumes', server?.id],
    queryFn: () => computeApi.listVolumes(server!.id),
    enabled: !!server,
  });
  const flavorsQ = useQuery({
    queryKey: ['flavors'],
    queryFn: computeApi.listFlavors,
    enabled: !!server,
  });

  if (!server) {
    return (
      <div className="grid h-full place-items-center p-6 text-center text-sm text-muted">
        {t('selectPrompt')}
      </div>
    );
  }

  const flavor = flavorsQ.data?.find((f) => f.id === server.flavorId);
  const spec: Array<{ label: string; value: React.ReactNode; mono?: boolean }> = [
    {
      label: t('specFlavor'),
      value: flavor
        ? `${flavor.name} — ${flavor.vcpus} vCPU · ${Math.round(flavor.ramMb / 1024)} GiB · ${flavor.diskGb} GiB`
        : '—',
    },
    { label: t('specImage'), value: server.imageName, mono: true },
    { label: t('specHost'), value: server.host, mono: true },
    { label: t('specAz'), value: server.availabilityZone, mono: true },
    { label: t('specPower'), value: <StatusBadge status={server.powerState} /> },
    { label: t('specKeypair'), value: server.keyName ?? '—', mono: true },
    { label: t('specLaunched'), value: server.launchedAt.slice(0, 10), mono: true },
    { label: t('tenant'), value: server.tenant, mono: true },
  ];

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-line px-3 py-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-semibold text-body">{server.name}</span>
            <StatusBadge status={server.status} />
          </div>
          <span className="font-mono text-2xs text-muted">
            {server.tenant} · {server.host}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-3 space-y-4">
        {/* Spec */}
        <section>
          <h3 className="mb-1.5 text-2xs font-semibold uppercase tracking-wider text-muted">
            {t('detailSpec')}
          </h3>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 rounded-lg border border-line p-2.5">
            {spec.map((row) => (
              <div key={row.label} className="min-w-0">
                <div className="text-2xs font-semibold uppercase tracking-wider text-faint">
                  {row.label}
                </div>
                <div className={`truncate text-xs text-body ${row.mono ? 'font-mono' : ''}`}>
                  {row.value}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Addresses */}
        <section>
          <h3 className="mb-1.5 text-2xs font-semibold uppercase tracking-wider text-muted">
            {t('detailAddresses')}
          </h3>
          {server.addresses.length === 0 ? (
            <p className="text-xs text-faint">{t('empty')}</p>
          ) : (
            <div className="overflow-hidden rounded-lg border border-line">
              <table className="w-full text-left text-xs">
                <thead className="bg-sunken text-2xs uppercase tracking-wider text-muted">
                  <tr>
                    <th className="px-2 py-1.5 font-semibold">{t('colNetwork')}</th>
                    <th className="px-2 py-1.5 font-semibold">{t('colIp')}</th>
                    <th className="px-2 py-1.5 font-semibold">{t('colType')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {server.addresses.map((a) => (
                    <tr key={`${a.network}-${a.ip}`} className="text-body">
                      <td className="px-2 py-1.5 font-mono">{a.network}</td>
                      <td className="px-2 py-1.5 font-mono">{a.ip}</td>
                      <td className="px-2 py-1.5">
                        {a.type === 'floating' ? t('typeFloating') : t('typeFixed')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Volumes */}
        <section>
          <h3 className="mb-1.5 text-2xs font-semibold uppercase tracking-wider text-muted">
            {t('detailVolumes')}
          </h3>
          {volumesQ.isPending ? (
            <LoadingRows rows={2} />
          ) : volumesQ.isError ? (
            <ErrorState onRetry={() => volumesQ.refetch()} t={t} />
          ) : volumesQ.data.length === 0 ? (
            <EmptyState t={t} />
          ) : (
            <div className="overflow-hidden rounded-lg border border-line">
              <table className="w-full text-left text-xs">
                <thead className="bg-sunken text-2xs uppercase tracking-wider text-muted">
                  <tr>
                    <th className="px-2 py-1.5 font-semibold">{t('colDevice')}</th>
                    <th className="px-2 py-1.5 font-semibold">{t('colVolumeName')}</th>
                    <th className="px-2 py-1.5 font-semibold">{t('colSize')}</th>
                    <th className="px-2 py-1.5 font-semibold">{t('colBootable')}</th>
                    <th className="px-2 py-1.5 font-semibold">{t('colStatus')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {volumesQ.data.map((v) => (
                    <tr key={v.id} className="text-body">
                      <td className="px-2 py-1.5 font-mono">{v.device}</td>
                      <td className="px-2 py-1.5 font-mono">{v.volumeName}</td>
                      <td className="px-2 py-1.5 font-mono">{v.sizeGb} GiB</td>
                      <td className="px-2 py-1.5">{v.bootable ? '✓' : '—'}</td>
                      <td className="px-2 py-1.5">
                        <StatusBadge status={v.status} />
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
