import { ComponentType, LazyExoticComponent } from 'react';
import { create } from 'zustand';
import { AppConfig } from '../types/window.types';
import { AboutApp } from '../apps/AboutApp';
import { ResumeApp } from '../apps/ResumeApp';
import { FederationInspectorApp } from '../apps/FederationInspectorApp';
import { DesignTokensApp } from '../apps/DesignTokensApp';
import { registerAppRemotes, RemoteRegistration } from '../federation/runtime';
import { fetchAppCatalog, resolveEntryUrl, CatalogApp } from '../federation/catalog';
import { federationLogger, useToastStore } from '../store/toastStore';
import { translateNow } from '../i18n';

/**
 * Reference to a federated remote module
 */
export interface RemoteRef extends RemoteRegistration {
  /** Exposed module name without the './' prefix, e.g. 'CalculatorApp' */
  module: string;
  /**
   * The manifest's production entry URL, unresolved. `entry` becomes the dev
   * URL under the dev server, so About's deployment list reads this instead.
   */
  prodEntry: string;
}

/**
 * Registry entry for an application
 */
export interface AppRegistryEntry {
  /** The React component to render (local apps only — remotes load via MF runtime) */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component?: ComponentType<any> | LazyExoticComponent<ComponentType<any>>;
  /** Default configuration for this app */
  defaultConfig: AppConfig;
  /** Whether this is a remote micro-frontend loaded via Module Federation */
  isRemote?: boolean;
  /** Federation reference (remote apps only) — WindowFrame loads from this */
  remote?: RemoteRef;
}

type RegistryStatus = 'loading' | 'ready' | 'degraded';

interface AppRegistryState {
  /** All launchable apps, keyed by componentType */
  entries: Record<string, AppRegistryEntry>;
  /** loading: catalog not resolved yet · ready: remotes registered · degraded: catalog failed, locals only */
  status: RegistryStatus;
}

/**
 * Local apps available regardless of the remote catalog
 */
const staticEntries: Record<string, AppRegistryEntry> = {
  /**
   * About App - Portfolio introduction in Korean
   */
  about: {
    component: AboutApp,
    defaultConfig: {
      componentType: 'about',
      title: 'About',
      icon: 'info', // lucide icon name
      defaultSize: { w: 560, h: 660 },
    },
  },

  /**
   * Resume - In-shell PDF viewer window
   * PDF path is configured in src/config/portfolio.config.ts (public/resume.pdf)
   */
  resume: {
    component: ResumeApp,
    defaultConfig: {
      componentType: 'resume',
      title: 'Resume',
      icon: 'file-text', // lucide icon name
      defaultSize: { w: 720, h: 820 },
    },
  },

  /**
   * Federation Inspector - live MF telemetry + one-click failure/recovery demo
   */
  inspector: {
    component: FederationInspectorApp,
    defaultConfig: {
      componentType: 'inspector',
      title: 'Inspector',
      icon: 'monitor', // lucide icon name (already in appIconMap)
      defaultSize: { w: 560, h: 560 },
    },
  },

  /**
   * Design Tokens - 3-layer token gallery + raw-color lint guardrail demo
   */
  tokens: {
    component: DesignTokensApp,
    defaultConfig: {
      componentType: 'tokens',
      title: 'Design Tokens',
      icon: 'palette', // lucide icon name (added to appIconMap)
      defaultSize: { w: 760, h: 660 },
    },
  },
};

/**
 * Application Registry Store
 *
 * Local apps are seeded statically; remote apps are merged in by
 * `initializeAppRegistry()` after they are registered with the MF runtime.
 * Components subscribe via this hook so the desktop updates when the
 * remote catalog resolves.
 */
export const useAppRegistry = create<AppRegistryState>(() => ({
  entries: staticEntries,
  status: 'loading',
}));

/**
 * Convert a catalog remote app into a registry entry
 */
function toRegistryEntry(app: CatalogApp): AppRegistryEntry {
  return {
    isRemote: true,
    remote: {
      name: app.remote!.name,
      entry: resolveEntryUrl(app.remote!),
      module: app.remote!.module,
      prodEntry: app.remote!.entryUrl,
    },
    defaultConfig: {
      componentType: app.id,
      title: app.title,
      icon: app.icon,
      defaultSize: app.defaultSize,
    },
  };
}

// Guards only the in-flight fetch (StrictMode mounts effects twice). It is
// cleared once settled: "already initialized" is judged from store state
// below, not from this module — during HMR the store module can be
// re-instantiated (re-seeding local apps + status 'loading') while this
// closure survives, and a module flag would then block the re-merge forever.
let initPromise: Promise<void> | null = null;

/**
 * Fetch the app catalog (public/remotes.manifest.json), register all
 * remotes with the MF runtime, and merge them into the registry.
 *
 * Idempotent based on store state: a no-op once the registry left 'loading'
 * (ready or degraded), but runs again if the store was re-seeded — which is
 * exactly the dev-HMR case where the remote entries were dropped.
 *
 * On failure the registry enters 'degraded' state: local apps stay usable,
 * remote apps simply don't appear on the desktop.
 */
export function initializeAppRegistry(): Promise<void> {
  if (initPromise) return initPromise;
  if (useAppRegistry.getState().status !== 'loading') return Promise.resolve();

  initPromise = (async () => {
    try {
      const catalog = await fetchAppCatalog();

      // v1 catalogs only carry remote apps; 'local'/'external' are reserved
      const remoteApps = catalog.apps.filter((app) => app.type === 'remote' && app.remote);

      const remoteEntries: Record<string, AppRegistryEntry> = {};
      const registrations: RemoteRegistration[] = [];
      for (const app of remoteApps) {
        const entry = toRegistryEntry(app);
        remoteEntries[app.id] = entry;
        registrations.push({ name: entry.remote!.name, entry: entry.remote!.entry });
      }

      registerAppRemotes(registrations);
      for (const registration of registrations) {
        federationLogger.connectionEstablished(registration.name, registration.entry);
      }

      useAppRegistry.setState((state) => ({
        entries: { ...state.entries, ...remoteEntries },
        status: 'ready',
      }));

      federationLogger.printBanner(
        registrations.map((r) => ({ name: r.name, url: r.entry })),
      );
    } catch (error) {
      useAppRegistry.setState({ status: 'degraded' });
      const message = error instanceof Error ? error.message : String(error);
      federationLogger.moduleFailed('app catalog', message);
      useToastStore.getState().addToast({
        type: 'error',
        message: translateNow('error.catalogFailed'),
        duration: 6000,
      });
    } finally {
      // Settled — the store's status ('ready' | 'degraded') now carries the
      // idempotence; keeping the promise would pin the pre-HMR result.
      initPromise = null;
    }
  })();

  return initPromise;
}

// Dev-only self-heal: when an HMR update re-instantiates this module, the
// fresh store re-seeds to local apps + status 'loading', and nothing re-runs
// App's mount effect (Fast Refresh re-renders without re-firing [] effects) —
// so the remote entries would stay dropped until a manual reload. Kicking the
// state-guarded initialization from the new module instance re-merges them.
// `import.meta.webpackHot` is undefined in prod builds (dead-code eliminated)
// and under Vitest, so boot semantics outside the dev server are unchanged.
if (import.meta.webpackHot) {
  initializeAppRegistry();
}

/**
 * Get an app entry from the registry by component type
 *
 * @param componentType - The type identifier for the app
 * @returns The registry entry or undefined if not found
 */
export function getApp(componentType: string): AppRegistryEntry | undefined {
  return useAppRegistry.getState().entries[componentType];
}
