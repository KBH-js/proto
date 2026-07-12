import { isDevelopment } from '../config/portfolio.config';
import { Size } from '../types/window.types';

/**
 * App Catalog (public/remotes.manifest.json)
 *
 * The catalog is a static asset served by the host, fetched at boot and fed
 * into the MF runtime. Because it is runtime data — not build configuration —
 * remotes can be added, moved, or updated by editing the deployed manifest,
 * without rebuilding the host.
 */

export interface CatalogRemote {
  /** MF container name, e.g. 'remoteCalculator' */
  name: string;
  /** Exposed module name without './', e.g. 'CalculatorApp' */
  module: string;
  /** Production entry — the remote's deployed mf-manifest.json */
  entryUrl: string;
  /** Optional dev-server entry, picked when the host runs in dev mode */
  devEntryUrl?: string;
}

export interface CatalogApp {
  id: string;
  title: string;
  icon: string;
  /** 'local' and 'external' are reserved for future catalog-driven app types */
  type: 'remote' | 'local' | 'external';
  defaultSize?: Size;
  remote?: CatalogRemote;
}

export interface AppCatalog {
  version: number;
  apps: CatalogApp[];
}

const MANIFEST_URL = '/remotes.manifest.json';

/**
 * Pick the entry URL for the current environment
 */
export function resolveEntryUrl(remote: CatalogRemote): string {
  return isDevelopment && remote.devEntryUrl ? remote.devEntryUrl : remote.entryUrl;
}

/**
 * Fetch and validate the app catalog.
 * @throws on network failure, non-2xx response, or malformed content
 */
export async function fetchAppCatalog(): Promise<AppCatalog> {
  const response = await fetch(MANIFEST_URL, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Failed to fetch app catalog: HTTP ${response.status}`);
  }

  const data = (await response.json()) as AppCatalog;
  if (typeof data?.version !== 'number' || !Array.isArray(data?.apps)) {
    throw new Error('Malformed app catalog: expected { version, apps[] }');
  }

  for (const app of data.apps) {
    if (!app.id || !app.title || !app.type) {
      throw new Error(`Malformed catalog app: ${JSON.stringify(app)}`);
    }
    if (app.type === 'remote' && !(app.remote?.name && app.remote?.module && app.remote?.entryUrl)) {
      throw new Error(`Catalog app '${app.id}' is missing remote {name, module, entryUrl}`);
    }
  }

  return data;
}
