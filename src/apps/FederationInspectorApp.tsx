import { version as reactVersion } from 'react';
import { Activity, Zap, Server, AlertTriangle, Play, ShieldAlert, HeartPulse } from 'lucide-react';
import { useAppRegistry } from '../registry/appRegistry';
import { useFederationStore, type RemoteStatus } from '../store/federationStore';
import { useWindowStore } from '../store/windowStore';
import { useToastStore } from '../store/toastStore';
import { forceRefreshRemote } from '../federation/runtime';
import { useTranslation, translateAppTitle } from '../i18n';

/**
 * Federation Inspector — makes the runtime Module Federation layer visible.
 *
 * Shows, per remote: the URL it was injected with (dev/prod), live load
 * status, last load time (ms), and load count — plus a one-click "Break"
 * that poisons a container and reopens its window so the per-frame
 * ErrorBoundary + Try Again recovery is demonstrated on demand.
 *
 * Local app (part of the host bundle), so it always renders even when the
 * remote catalog is degraded.
 */

/** RFC 2606 reserved TLD — resolves nowhere, so the load fails fast + cleanly. */
const CHAOS_URL = 'https://chaos.invalid/mf-manifest.json';

const STATUS_STYLE: Record<RemoteStatus, string> = {
  registered: 'bg-gray-100 text-gray-600',
  loading: 'bg-amber-100 text-amber-700',
  loaded: 'bg-green-100 text-green-700',
  error: 'bg-red-100 text-red-700',
  chaos: 'bg-purple-100 text-purple-700',
};

const STATUS_LABEL: Record<RemoteStatus, string> = {
  registered: 'inspector.stRegistered',
  loading: 'inspector.stLoading',
  loaded: 'inspector.stLoaded',
  error: 'inspector.stError',
  chaos: 'inspector.stChaos',
};

export function FederationInspectorApp() {
  const { t } = useTranslation();
  const entries = useAppRegistry((s) => s.entries);
  const registryStatus = useAppRegistry((s) => s.status);
  const telemetry = useFederationStore((s) => s.remotes);
  const markChaos = useFederationStore((s) => s.markChaos);
  const openWindow = useWindowStore((s) => s.openWindow);
  const closeWindow = useWindowStore((s) => s.closeWindow);
  const addToast = useToastStore((s) => s.addToast);

  const remoteApps = Object.values(entries).filter((e) => e.isRemote && e.remote);

  const handleOpen = (componentType: string, title: string) => {
    openWindow(componentType, title);
  };

  const handleBreak = (componentType: string, title: string, name: string) => {
    // Poison the container with a dead URL (simulates a stale/redeployed chunk)…
    forceRefreshRemote({ name, entry: CHAOS_URL });
    markChaos(name);
    // …then reopen a fresh window so the failed load hits the ErrorBoundary.
    const open = useWindowStore.getState().windows.find((w) => w.componentType === componentType);
    if (open) closeWindow(open.id);
    openWindow(componentType, title);
    addToast({
      type: 'warning',
      message: t('inspector.chaosToast', { name: translateAppTitle(t, componentType, title) }),
      duration: 5000,
    });
  };

  const handleHealAll = () => {
    for (const e of remoteApps) {
      if (e.remote) forceRefreshRemote({ name: e.remote.name, entry: e.remote.entry });
    }
    addToast({ type: 'success', message: t('inspector.healToast'), duration: 3000 });
  };

  const registryTone =
    registryStatus === 'ready'
      ? 'bg-green-100 text-green-700'
      : registryStatus === 'degraded'
        ? 'bg-red-100 text-red-700'
        : 'bg-amber-100 text-amber-700';
  const registryLabel =
    registryStatus === 'ready'
      ? t('inspector.statusReady')
      : registryStatus === 'degraded'
        ? t('inspector.statusDegraded')
        : t('inspector.statusLoading');

  return (
    <div className="flex flex-col h-full bg-white overflow-auto text-gray-800">
      {/* Header */}
      <div className="p-5 bg-gradient-to-r from-indigo-600 to-violet-700 text-white">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold">{t('inspector.title')}</h1>
            <p className="text-xs text-white/80">{t('inspector.subtitle')}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 p-5 space-y-5">
        {/* Top summary — React singleton + registry status */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl border border-violet-100 bg-violet-50">
            <div className="flex items-center gap-2 text-violet-700">
              <Zap className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">
                {t('inspector.reactSingleton')}
              </span>
            </div>
            <p className="mt-1 text-lg font-bold text-gray-800">React {reactVersion}</p>
            <p className="text-[11px] text-gray-500">{t('inspector.singletonCaption')}</p>
          </div>
          <div className="p-3 rounded-xl border border-gray-100 bg-gray-50">
            <div className="flex items-center gap-2 text-gray-600">
              <Server className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">
                {t('inspector.registryStatus')}
              </span>
            </div>
            <span className={`mt-2 inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${registryTone}`}>
              {registryLabel}
            </span>
          </div>
        </div>

        {/* Remotes table */}
        <div className="rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-200">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              {t('inspector.colApp')}
            </span>
            <button
              onClick={handleHealAll}
              className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 transition-colors"
              title={t('inspector.healAllTitle')}
            >
              <HeartPulse className="w-3.5 h-3.5" />
              {t('inspector.healAll')}
            </button>
          </div>

          {remoteApps.length === 0 ? (
            <div className="px-3 py-6 text-center text-sm text-gray-400">
              {t('inspector.noRemotes')}
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {remoteApps.map((e) => {
                const remote = e.remote!;
                const tele = telemetry[remote.name];
                const status: RemoteStatus = tele?.status ?? 'registered';
                const entry = tele?.entry ?? remote.entry;
                const isDev = (tele?.resolvedFrom ?? (entry.includes('localhost') ? 'dev' : 'prod')) === 'dev';
                const isChaos = tele?.resolvedFrom === 'chaos';
                const title = translateAppTitle(t, e.defaultConfig.componentType, e.defaultConfig.title);

                return (
                  <li key={remote.name} className="px-3 py-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm text-gray-800">{title}</span>
                          <span className="text-[10px] font-mono text-gray-400">
                            {remote.name}/{remote.module}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span
                            className={`px-1 py-0.5 rounded text-[9px] font-bold uppercase ${
                              isChaos
                                ? 'bg-red-100 text-red-600'
                                : isDev
                                  ? 'bg-cyan-100 text-cyan-700'
                                  : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {isChaos ? 'CHAOS' : isDev ? t('inspector.dev') : t('inspector.prod')}
                          </span>
                          <span className="text-[11px] text-gray-500 font-mono truncate max-w-[220px]" title={entry}>
                            {entry}
                          </span>
                        </div>
                        {tele?.error && (
                          <p className="mt-1 text-[11px] text-red-500 truncate max-w-[300px]" title={tele.error}>
                            {tele.error}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${STATUS_STYLE[status]}`}>
                          {t(STATUS_LABEL[status])}
                        </span>
                        <span className="text-[11px] text-gray-500 tabular-nums">
                          {tele?.lastLoadMs != null ? `${tele.lastLoadMs}ms` : t('inspector.notLoaded')}
                          <span className="text-gray-300"> · </span>
                          {t('inspector.colLoads')} {tele?.loadCount ?? 0}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 mt-2">
                      <button
                        onClick={() => handleOpen(e.defaultConfig.componentType, e.defaultConfig.title)}
                        className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors"
                      >
                        <Play className="w-3 h-3" />
                        {t('inspector.openApp')}
                      </button>
                      <button
                        onClick={() => handleBreak(e.defaultConfig.componentType, e.defaultConfig.title, remote.name)}
                        className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium text-red-700 bg-red-50 hover:bg-red-100 transition-colors"
                        title={t('inspector.breakTitle')}
                      >
                        <ShieldAlert className="w-3 h-3" />
                        {t('inspector.break')}
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Explainer */}
        <div className="flex gap-2 p-3 rounded-xl bg-amber-50 border border-amber-100">
          <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-[11px] text-amber-800 leading-relaxed">{t('inspector.explainer')}</p>
        </div>
      </div>
    </div>
  );
}
