/**
 * App-facing data facade consumed by TanStack Query.
 *
 * Isomorphic transport: when the standalone MSW worker is running
 * (`window.__PROTO_COMPUTE_MSW__`), it issues real `fetch` against
 * `/api/nova/*` (intercepted by MSW). Otherwise — inside the host, where a
 * cross-origin service worker is impossible — it reads the same in-memory db
 * directly. Both paths share one dataset, so behavior is identical.
 *
 * The flag is read per call (not captured at module load) because the
 * standalone bootstrap sets it after this module has already been imported.
 */
import * as db from './db';
import type { Server, Flavor, Hypervisor, VolumeAttachment, ComputeSummary } from './types';

const BASE = '/api/nova';

function mswActive(): boolean {
  return typeof window !== 'undefined' && window.__PROTO_COMPUTE_MSW__ === true;
}

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) {
    throw new Error(`Request failed: HTTP ${res.status} on ${path}`);
  }
  return (await res.json()) as T;
}

export const computeApi = {
  listServers: (): Promise<Server[]> => (mswActive() ? fetchJson('/servers') : db.listServers()),
  listFlavors: (): Promise<Flavor[]> => (mswActive() ? fetchJson('/flavors') : db.listFlavors()),
  listHypervisors: (): Promise<Hypervisor[]> =>
    mswActive() ? fetchJson('/hypervisors') : db.listHypervisors(),
  listVolumes: (serverId: string): Promise<VolumeAttachment[]> =>
    mswActive() ? fetchJson(`/servers/${serverId}/volumes`) : db.listVolumes(serverId),
  getSummary: (): Promise<ComputeSummary> =>
    mswActive() ? fetchJson('/summary') : db.getSummary(),
};

export { fetchJson };
