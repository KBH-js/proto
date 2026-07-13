/**
 * App-facing data facade consumed by TanStack Query.
 *
 * Isomorphic transport: when the standalone MSW worker is running
 * (`window.__PROTO_NET_MSW__`), it issues real `fetch` against
 * `/api/neutron/*` (intercepted by MSW). Otherwise — inside the host, where a
 * cross-origin service worker is impossible — it reads the same in-memory db
 * directly. Both paths share one dataset, so behavior is identical.
 *
 * The flag is read per call (not captured at module load) because the
 * standalone bootstrap sets it after this module has already been imported.
 */
import * as db from './db';
import type { NeutronNetwork, Router, FloatingIp, Port, NetworkSummary } from './types';

const BASE = '/api/neutron';

function mswActive(): boolean {
  return typeof window !== 'undefined' && window.__PROTO_NET_MSW__ === true;
}

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) {
    throw new Error(`Request failed: HTTP ${res.status} on ${path}`);
  }
  return (await res.json()) as T;
}

export const networkApi = {
  listNetworks: (): Promise<NeutronNetwork[]> =>
    mswActive() ? fetchJson('/networks') : db.listNetworks(),
  listRouters: (): Promise<Router[]> => (mswActive() ? fetchJson('/routers') : db.listRouters()),
  listFloatingIps: (): Promise<FloatingIp[]> =>
    mswActive() ? fetchJson('/floatingips') : db.listFloatingIps(),
  listPorts: (networkId: string): Promise<Port[]> =>
    mswActive() ? fetchJson(`/networks/${networkId}/ports`) : db.listPorts(networkId),
  getSummary: (): Promise<NetworkSummary> =>
    mswActive() ? fetchJson('/summary') : db.getSummary(),
};

export { fetchJson };
