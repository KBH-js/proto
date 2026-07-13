// @vitest-environment node
// Node env (like src/federation/catalog.test.ts): MSW + undici fetch are
// reliable here, whereas happy-dom's Response locks its stream under MSW.
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { server } from '../../../../src/test/msw/server';
import { handlers as networkHandlers } from '../mocks/handlers';
import { fetchJson, networkApi } from './networkApi';
import type { NeutronNetwork, NetworkSummary } from './types';
import * as db from './db';

beforeEach(() => {
  db.setOutage(false);
  db.setLatency(0);
  server.use(...networkHandlers); // added atop the shared server; reset each test
});

afterEach(() => {
  delete (globalThis as { window?: unknown }).window;
});

describe('networkApi REST contract (MSW)', () => {
  it('fetchJson parses the mocked /networks endpoint', async () => {
    const nets = await fetchJson<NeutronNetwork[]>('/networks');
    expect(nets.length).toBeGreaterThan(0);
    expect(nets[0].id).toMatch(/^net-/);
  });

  it('fetchJson throws when the endpoint returns a 503 (armed outage)', async () => {
    db.setOutage(true);
    await expect(fetchJson('/networks')).rejects.toThrow(/HTTP 503/);
  });

  it('facade uses the in-memory transport when MSW is inactive', async () => {
    // No window flag → mswActive() is false → reads db directly.
    const summary = await networkApi.getSummary();
    expect(summary).toHaveProperty('networks');
  });

  it('facade routes through fetch/MSW when __PROTO_NET_MSW__ is set', async () => {
    (globalThis as { window?: unknown }).window = { __PROTO_NET_MSW__: true };
    const summary: NetworkSummary = await networkApi.getSummary();
    expect(summary.health).toBe('critical');
    expect(summary.routers).toBeGreaterThan(0);
  });
});
