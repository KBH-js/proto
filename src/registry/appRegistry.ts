import { ComponentType, LazyExoticComponent } from 'react';
import { create } from 'zustand';
import { AppConfig, Size } from '../types/window.types';
import { AboutApp } from '../apps/AboutApp';
import { ResumeApp } from '../apps/ResumeApp';
import { FederationInspectorApp } from '../apps/FederationInspectorApp';
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
    },
    defaultConfig: {
      componentType: app.id,
      title: app.title,
      icon: app.icon,
      defaultSize: app.defaultSize,
    },
  };
}

// Module-level promise guards StrictMode double-invocation of effects
let initPromise: Promise<void> | null = null;

/**
 * Fetch the app catalog (public/remotes.manifest.json), register all
 * remotes with the MF runtime, and merge them into the registry. Idempotent.
 *
 * On failure the registry enters 'degraded' state: local apps stay usable,
 * remote apps simply don't appear on the desktop.
 */
export function initializeAppRegistry(): Promise<void> {
  if (initPromise) return initPromise;

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
    }
  })();

  return initPromise;
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

/**
 * Get all available apps for the desktop launcher
 *
 * @returns Array of app configs that can be launched
 */
export function getAvailableApps(): AppConfig[] {
  return Object.values(useAppRegistry.getState().entries).map((entry) => entry.defaultConfig);
}

/**
 * Get the default size for an app, falling back to system default
 *
 * @param componentType - The type identifier for the app
 * @param fallback - Fallback size if app has no default
 */
export function getAppDefaultSize(componentType: string, fallback: Size): Size {
  const app = getApp(componentType);
  return app?.defaultConfig.defaultSize ?? fallback;
}
