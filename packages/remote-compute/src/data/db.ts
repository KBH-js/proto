/**
 * In-memory Nova dataset + async selectors.
 *
 * The single source of truth behind BOTH transports (MSW handlers and the
 * embedded facade), so the data is identical whether the app runs standalone
 * (real `fetch` + MSW) or inside the host (direct in-memory).
 *
 * Deterministic (no randomness) so tests are reproducible. Selectors return
 * Promises with artificial latency; when `outage` is set they reject, which
 * drives the TanStack Query loading → error → retry → recovery demo.
 *
 * Fixed IPs intentionally match remote-network's floating-IP fixed IPs
 * (e.g. 192.168.10.24 ↔ fip 203.0.113.10) so the two OpenStack dashboards
 * tell one coherent story.
 */
import type {
  Server,
  Flavor,
  Hypervisor,
  VolumeAttachment,
  ComputeSummary,
  Health,
} from './types';

// ---- Failure / latency injection --------------------------------------------

let outage = false;
let latencyMs = 650;

/** Toggle the simulated control-plane outage (UI "Simulate outage"). */
export function setOutage(value: boolean): void {
  outage = value;
}
export function isOutage(): boolean {
  return outage;
}
/** Override latency (tests set 0 for speed). */
export function setLatency(ms: number): void {
  latencyMs = ms;
}

class NovaApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'NovaApiError';
  }
}

/** Resolve after the configured latency, or reject if an outage is armed. */
function respond<T>(value: T): Promise<T> {
  return new Promise((resolve, reject) => {
    const done = () =>
      outage
        ? reject(new NovaApiError(503, 'Nova control plane unreachable (simulated outage)'))
        : resolve(value);
    if (latencyMs <= 0) done();
    else setTimeout(done, latencyMs);
  });
}

// ---- Seed data --------------------------------------------------------------

const flavors: Flavor[] = [
  { id: 'flv-0001', name: 'm1.small', vcpus: 1, ramMb: 2048, diskGb: 20, ephemeralGb: 0, swapMb: 0, isPublic: true },
  { id: 'flv-0002', name: 'm1.medium', vcpus: 2, ramMb: 4096, diskGb: 40, ephemeralGb: 0, swapMb: 0, isPublic: true },
  { id: 'flv-0003', name: 'm1.large', vcpus: 4, ramMb: 8192, diskGb: 80, ephemeralGb: 20, swapMb: 0, isPublic: true },
  { id: 'flv-0004', name: 'c2.xlarge', vcpus: 8, ramMb: 16384, diskGb: 160, ephemeralGb: 40, swapMb: 2048, isPublic: true },
  { id: 'flv-0005', name: 'r1.highmem', vcpus: 4, ramMb: 32768, diskGb: 80, ephemeralGb: 0, swapMb: 4096, isPublic: false },
];

const hypervisors: Hypervisor[] = [
  {
    id: 'hv-0001', hostname: 'compute-01', type: 'QEMU', state: 'up', status: 'enabled',
    vcpus: 32, vcpusUsed: 18, memoryMb: 131072, memoryMbUsed: 67584, localGb: 1024, localGbUsed: 410, runningVms: 4,
  },
  {
    id: 'hv-0002', hostname: 'compute-02', type: 'QEMU', state: 'up', status: 'enabled',
    vcpus: 32, vcpusUsed: 12, memoryMb: 131072, memoryMbUsed: 49152, localGb: 1024, localGbUsed: 288, runningVms: 3,
  },
  {
    id: 'hv-0003', hostname: 'compute-03', type: 'QEMU', state: 'up', status: 'disabled',
    vcpus: 32, vcpusUsed: 5, memoryMb: 131072, memoryMbUsed: 18432, localGb: 1024, localGbUsed: 120, runningVms: 2,
  },
  {
    id: 'hv-0004', hostname: 'compute-04', type: 'QEMU', state: 'down', status: 'enabled',
    vcpus: 32, vcpusUsed: 1, memoryMb: 131072, memoryMbUsed: 2048, localGb: 1024, localGbUsed: 20, runningVms: 1,
  },
];

const servers: Server[] = [
  {
    id: 'srv-0001', name: 'web-a-01', status: 'ACTIVE', powerState: 'RUNNING', taskState: null,
    flavorId: 'flv-0001', imageName: 'ubuntu-22.04', host: 'compute-01', availabilityZone: 'nova',
    keyName: 'a-deploy', locked: false, tenant: 'project-a', launchedAt: '2026-05-02T09:14:00Z',
    addresses: [
      { network: 'tenant-a-net', ip: '192.168.10.24', type: 'fixed', version: 4 },
      { network: 'public-ext', ip: '203.0.113.10', type: 'floating', version: 4 },
    ],
  },
  {
    id: 'srv-0002', name: 'web-a-02', status: 'ACTIVE', powerState: 'RUNNING', taskState: null,
    flavorId: 'flv-0001', imageName: 'ubuntu-22.04', host: 'compute-02', availabilityZone: 'nova',
    keyName: 'a-deploy', locked: false, tenant: 'project-a', launchedAt: '2026-05-02T09:16:00Z',
    addresses: [
      { network: 'tenant-a-net', ip: '192.168.10.31', type: 'fixed', version: 4 },
      { network: 'public-ext', ip: '203.0.113.11', type: 'floating', version: 4 },
    ],
  },
  {
    id: 'srv-0003', name: 'db-a-01', status: 'ACTIVE', powerState: 'RUNNING', taskState: null,
    flavorId: 'flv-0005', imageName: 'postgres-16-golden', host: 'compute-01', availabilityZone: 'nova',
    keyName: 'a-deploy', locked: true, tenant: 'project-a', launchedAt: '2026-04-18T02:40:00Z',
    addresses: [
      { network: 'tenant-a-net', ip: '192.168.10.77', type: 'fixed', version: 4 },
      { network: 'tenant-a-net', ip: 'fd00:a::77', type: 'fixed', version: 6 },
      { network: 'public-ext', ip: '203.0.113.18', type: 'floating', version: 4 },
    ],
  },
  {
    id: 'srv-0004', name: 'api-b-01', status: 'ACTIVE', powerState: 'RUNNING', taskState: null,
    flavorId: 'flv-0002', imageName: 'rocky-9', host: 'compute-02', availabilityZone: 'nova',
    keyName: 'b-ops', locked: false, tenant: 'project-b', launchedAt: '2026-05-20T11:03:00Z',
    addresses: [
      { network: 'tenant-b-net', ip: '192.168.20.14', type: 'fixed', version: 4 },
      { network: 'public-ext', ip: '203.0.113.12', type: 'floating', version: 4 },
    ],
  },
  {
    id: 'srv-0005', name: 'worker-b-01', status: 'ACTIVE', powerState: 'RUNNING', taskState: null,
    flavorId: 'flv-0003', imageName: 'rocky-9', host: 'compute-03', availabilityZone: 'nova',
    keyName: 'b-ops', locked: false, tenant: 'project-b', launchedAt: '2026-06-01T08:22:00Z',
    addresses: [
      { network: 'tenant-b-net', ip: '192.168.20.55', type: 'fixed', version: 4 },
      { network: 'public-ext', ip: '203.0.113.14', type: 'floating', version: 4 },
    ],
  },
  {
    id: 'srv-0006', name: 'batch-b-01', status: 'SHUTOFF', powerState: 'SHUTDOWN', taskState: null,
    flavorId: 'flv-0002', imageName: 'rocky-9', host: 'compute-01', availabilityZone: 'nova',
    keyName: 'b-ops', locked: false, tenant: 'project-b', launchedAt: '2026-03-11T22:05:00Z',
    addresses: [{ network: 'tenant-b-net', ip: '192.168.20.61', type: 'fixed', version: 4 }],
  },
  {
    id: 'srv-0007', name: 'mon-admin-01', status: 'ACTIVE', powerState: 'RUNNING', taskState: null,
    flavorId: 'flv-0004', imageName: 'debian-12', host: 'compute-02', availabilityZone: 'internal',
    keyName: 'infra-root', locked: false, tenant: 'admin', launchedAt: '2026-02-05T05:00:00Z',
    addresses: [
      { network: 'mgmt-net', ip: '10.0.0.42', type: 'fixed', version: 4 },
      { network: 'public-ext', ip: '203.0.113.16', type: 'floating', version: 4 },
    ],
  },
  {
    id: 'srv-0008', name: 'build-c-01', status: 'BUILD', powerState: 'NOSTATE', taskState: 'spawning',
    flavorId: 'flv-0001', imageName: 'ubuntu-22.04', host: 'compute-03', availabilityZone: 'nova',
    keyName: null, locked: false, tenant: 'project-c', launchedAt: '2026-07-15T01:12:00Z',
    addresses: [],
  },
  {
    id: 'srv-0009', name: 'legacy-app-01', status: 'ERROR', powerState: 'CRASHED', taskState: null,
    flavorId: 'flv-0001', imageName: 'centos-7', host: 'compute-04', availabilityZone: 'nova',
    keyName: null, locked: false, tenant: 'project-legacy', launchedAt: '2025-11-30T13:45:00Z',
    addresses: [{ network: 'legacy-net', ip: '192.168.99.12', type: 'fixed', version: 4 }],
  },
  {
    id: 'srv-0010', name: 'sec-dmz-01', status: 'PAUSED', powerState: 'PAUSED', taskState: null,
    flavorId: 'flv-0001', imageName: 'hardened-alpine', host: 'compute-01', availabilityZone: 'nova',
    keyName: 'sec-audit', locked: true, tenant: 'project-sec', launchedAt: '2026-01-22T16:30:00Z',
    addresses: [{ network: 'dmz-net', ip: '172.16.0.5', type: 'fixed', version: 4 }],
  },
];

/**
 * Deterministic volume attachments per server: every booted server carries a
 * boot volume sized by its flavor disk; db/worker servers get an extra data
 * volume. BUILD servers have no attachments yet; on an ERROR server the
 * attachment surfaces as `error`.
 */
function buildVolumes(): Record<string, VolumeAttachment[]> {
  const map: Record<string, VolumeAttachment[]> = {};
  servers.forEach((srv) => {
    if (srv.status === 'BUILD') {
      map[srv.id] = [];
      return;
    }
    const flavor = flavors.find((f) => f.id === srv.flavorId);
    const status = srv.status === 'ERROR' ? 'error' : 'in-use';
    const vols: VolumeAttachment[] = [
      {
        id: `vol-${srv.id.slice(-4)}-0`,
        device: '/dev/vda',
        volumeName: `${srv.name}-boot`,
        sizeGb: flavor?.diskGb ?? 20,
        bootable: true,
        status,
      },
    ];
    if (/^(db|worker)-/.test(srv.name)) {
      vols.push({
        id: `vol-${srv.id.slice(-4)}-1`,
        device: '/dev/vdb',
        volumeName: `${srv.name}-data`,
        sizeGb: 200,
        bootable: false,
        status,
      });
    }
    map[srv.id] = vols;
  });
  return map;
}

const volumesByServer = buildVolumes();

// ---- Selectors (async, latency + outage aware) ------------------------------

export function listServers(): Promise<Server[]> {
  return respond(servers.map((s) => ({ ...s })));
}

export function listFlavors(): Promise<Flavor[]> {
  return respond(flavors.map((f) => ({ ...f })));
}

export function listHypervisors(): Promise<Hypervisor[]> {
  return respond(hypervisors.map((h) => ({ ...h })));
}

export function listVolumes(serverId: string): Promise<VolumeAttachment[]> {
  return respond((volumesByServer[serverId] ?? []).map((v) => ({ ...v })));
}

export function getSummary(): Promise<ComputeSummary> {
  const activeServers = servers.filter((s) => s.status === 'ACTIVE').length;
  const vcpusUsed = hypervisors.reduce((sum, h) => sum + h.vcpusUsed, 0);
  const vcpusTotal = hypervisors.reduce((sum, h) => sum + h.vcpus, 0);
  const memoryMbUsed = hypervisors.reduce((sum, h) => sum + h.memoryMbUsed, 0);
  const memoryMbTotal = hypervisors.reduce((sum, h) => sum + h.memoryMb, 0);
  const hypervisorsUp = hypervisors.filter((h) => h.state === 'up').length;

  const hasError =
    servers.some((s) => s.status === 'ERROR') || hypervisors.some((h) => h.state === 'down');
  const hasDegraded =
    servers.some((s) => s.status === 'BUILD' || s.status === 'SHUTOFF' || s.status === 'PAUSED') ||
    hypervisors.some((h) => h.status === 'disabled');
  const health: Health = hasError ? 'critical' : hasDegraded ? 'degraded' : 'healthy';

  return respond({
    servers: servers.length,
    activeServers,
    vcpusUsed,
    vcpusTotal,
    memoryMbUsed,
    memoryMbTotal,
    hypervisors: hypervisors.length,
    hypervisorsUp,
    health,
  });
}
