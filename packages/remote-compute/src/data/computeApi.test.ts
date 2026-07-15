// @vitest-environment node
// Node env (like src/federation/catalog.test.ts): MSW + undici fetch are
// reliable here, whereas happy-dom's Response locks its stream under MSW.
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { server } from '../../../../src/test/msw/server';
import { handlers as computeHandlers } from '../mocks/handlers';
import { fetchJson, computeApi } from './computeApi';
import type { Server, ComputeSummary } from './types';
import * as db from './db';

beforeEach(() => {
  db.setOutage(false);
  db.setLatency(0);
  server.use(...computeHandlers); // added atop the shared server; reset each test
});

afterEach(() => {
  delete (globalThis as { window?: unknown }).window;
});

describe('computeApi REST contract (MSW)', () => {
  it('fetchJson parses the mocked /servers endpoint', async () => {
    const servers = await fetchJson<Server[]>('/servers');
    expect(servers.length).toBeGreaterThan(0);
    expect(servers[0].id).toMatch(/^srv-/);
  });

  it('fetchJson throws when the endpoint returns a 503 (armed outage)', async () => {
    db.setOutage(true);
    await expect(fetchJson('/servers')).rejects.toThrow(/HTTP 503/);
  });

  it('facade uses the in-memory transport when MSW is inactive', async () => {
    // No window flag → mswActive() is false → reads db directly.
    const summary = await computeApi.getSummary();
    expect(summary).toHaveProperty('servers');
  });

  it('facade routes through fetch/MSW when __PROTO_COMPUTE_MSW__ is set', async () => {
    (globalThis as { window?: unknown }).window = { __PROTO_COMPUTE_MSW__: true };
    const summary: ComputeSummary = await computeApi.getSummary();
    expect(summary.health).toBe('critical');
    expect(summary.hypervisors).toBeGreaterThan(0);
  });
});
