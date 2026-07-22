import { http, HttpResponse } from 'msw';
import type { AppCatalog } from '../../federation/catalog';

/**
 * A valid catalog fixture mirroring public/remotes.manifest.json — the
 * happy-path response for the manifest endpoint.
 */
export const validCatalog: AppCatalog = {
  version: 1,
  apps: [
    {
      id: 'network',
      title: 'Network',
      icon: 'network',
      type: 'remote',
      defaultSize: { w: 860, h: 620 },
      remote: {
        name: 'remoteNetwork',
        module: 'NetworkApp',
        entryUrl: 'https://remote-network.vercel.app/mf-manifest.json',
        devEntryUrl: 'http://localhost:5003/mf-manifest.json',
      },
    },
    {
      id: 'compute',
      title: 'Compute',
      icon: 'server',
      type: 'remote',
      defaultSize: { w: 860, h: 620 },
      remote: {
        name: 'remoteCompute',
        module: 'ComputeApp',
        entryUrl: 'https://remote-compute.vercel.app/mf-manifest.json',
        devEntryUrl: 'http://localhost:5004/mf-manifest.json',
      },
    },
  ],
};

/** Matches the manifest fetch on any host (happy-dom resolves the relative URL). */
export const MANIFEST_PATTERN = '*/remotes.manifest.json';

export const handlers = [
  http.get(MANIFEST_PATTERN, () => HttpResponse.json(validCatalog)),
];
