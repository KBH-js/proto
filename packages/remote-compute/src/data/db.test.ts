import { describe, it, expect, beforeEach } from 'vitest';
import * as db from './db';

beforeEach(() => {
  db.setOutage(false);
  db.setLatency(0);
});

describe('db selectors', () => {
  it('lists servers, each carrying its addresses', async () => {
    const servers = await db.listServers();
    expect(servers.length).toBeGreaterThan(0);
    expect(servers[0]).toHaveProperty('addresses');
    expect(Array.isArray(servers[0].addresses)).toBe(true);
  });

  it('every server references an existing flavor and hypervisor', async () => {
    const [servers, flavors, hypervisors] = await Promise.all([
      db.listServers(),
      db.listFlavors(),
      db.listHypervisors(),
    ]);
    const flavorIds = new Set(flavors.map((f) => f.id));
    const hosts = new Set(hypervisors.map((h) => h.hostname));
    expect(servers.every((s) => flavorIds.has(s.flavorId))).toBe(true);
    expect(servers.every((s) => hosts.has(s.host))).toBe(true);
  });

  it('returns volumes for a booted server and empty for an unknown id', async () => {
    const servers = await db.listServers();
    const active = servers.find((s) => s.status === 'ACTIVE')!;
    const volumes = await db.listVolumes(active.id);
    expect(volumes.length).toBeGreaterThan(0);
    expect(volumes.some((v) => v.bootable)).toBe(true);
    expect(await db.listVolumes('does-not-exist')).toEqual([]);

    const building = servers.find((s) => s.status === 'BUILD')!;
    expect(await db.listVolumes(building.id)).toEqual([]);
  });

  it('summary aggregates capacity and derives health (dataset has an ERROR server)', async () => {
    const s = await db.getSummary();
    expect(s.servers).toBeGreaterThan(0);
    expect(s.activeServers).toBeLessThanOrEqual(s.servers);
    expect(s.vcpusUsed).toBeLessThanOrEqual(s.vcpusTotal);
    expect(s.memoryMbUsed).toBeLessThanOrEqual(s.memoryMbTotal);
    expect(s.hypervisorsUp).toBeLessThanOrEqual(s.hypervisors);
    expect(s.health).toBe('critical');
  });

  it('rejects with a 503-style error when an outage is armed', async () => {
    db.setOutage(true);
    await expect(db.listServers()).rejects.toThrow(/outage/i);
    await expect(db.getSummary()).rejects.toThrow(/unreachable/i);
  });
});
