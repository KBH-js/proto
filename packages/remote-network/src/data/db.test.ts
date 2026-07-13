import { describe, it, expect, beforeEach } from 'vitest';
import * as db from './db';

beforeEach(() => {
  db.setOutage(false);
  db.setLatency(0);
});

describe('db selectors', () => {
  it('lists networks, each carrying its subnets', async () => {
    const nets = await db.listNetworks();
    expect(nets.length).toBeGreaterThan(0);
    expect(nets[0]).toHaveProperty('subnets');
    expect(Array.isArray(nets[0].subnets)).toBe(true);
  });

  it('returns ports for a real network and empty for an unknown id', async () => {
    const nets = await db.listNetworks();
    const active = nets.find((n) => n.subnets.length > 0)!;
    const ports = await db.listPorts(active.id);
    expect(ports.length).toBeGreaterThan(0);
    expect(ports.every((p) => p.networkId === active.id)).toBe(true);
    expect(await db.listPorts('does-not-exist')).toEqual([]);
  });

  it('summary aggregates counts and derives health (dataset has an ERROR net)', async () => {
    const s = await db.getSummary();
    expect(s.networks).toBeGreaterThan(0);
    expect(s.floatingIpsInUse).toBeLessThanOrEqual(s.floatingIps);
    expect(s.health).toBe('critical');
  });

  it('rejects with a 503-style error when an outage is armed', async () => {
    db.setOutage(true);
    await expect(db.listNetworks()).rejects.toThrow(/outage/i);
    await expect(db.getSummary()).rejects.toThrow(/unreachable/i);
  });
});
