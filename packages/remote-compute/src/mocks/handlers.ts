import { http, HttpResponse } from 'msw';
import * as db from '../data/db';

/**
 * MSW REST handlers over the shared in-memory db. Used by the standalone
 * browser worker (src/mocks/browser.ts) and by Vitest (node) contract tests.
 *
 * Patterns are host-agnostic (leading wildcard) so they match regardless of
 * origin — the app fetches root-relative "/api/nova/...". db selectors carry
 * the latency and outage behavior; an armed outage surfaces here as a 503.
 */

type JsonBody = Parameters<typeof HttpResponse.json>[0];

async function ok<T>(fn: () => Promise<T>): Promise<Response> {
  try {
    const data = await fn();
    return HttpResponse.json(data as JsonBody);
  } catch (e) {
    const status = (e as { status?: number }).status ?? 500;
    return HttpResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status });
  }
}

export const handlers = [
  http.get('*/api/nova/servers', () => ok(() => db.listServers())),
  http.get('*/api/nova/flavors', () => ok(() => db.listFlavors())),
  http.get('*/api/nova/hypervisors', () => ok(() => db.listHypervisors())),
  http.get('*/api/nova/servers/:id/volumes', ({ params }) =>
    ok(() => db.listVolumes(String(params.id))),
  ),
  http.get('*/api/nova/summary', () => ok(() => db.getSummary())),
];
