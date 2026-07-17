/**
 * In-memory Neutron dataset + async selectors.
 *
 * The single source of truth behind BOTH transports (MSW handlers and the
 * embedded facade), so the data is identical whether the app runs standalone
 * (real `fetch` + MSW) or inside the host (direct in-memory).
 *
 * Deterministic (no randomness) so tests are reproducible. Selectors return
 * Promises with artificial latency; when `outage` is set they reject, which
 * drives the TanStack Query loading → error → retry → recovery demo.
 */
import type {
  NeutronNetwork,
  Router,
  FloatingIp,
  Port,
  NetworkSummary,
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

class NeutronApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'NeutronApiError';
  }
}

/** Resolve after the configured latency, or reject if an outage is armed. */
function respond<T>(value: T): Promise<T> {
  return new Promise((resolve, reject) => {
    const done = () =>
      outage
        ? reject(new NeutronApiError(503, 'Neutron control plane unreachable (simulated outage)'))
        : resolve(value);
    if (latencyMs <= 0) done();
    else setTimeout(done, latencyMs);
  });
}

// ---- Seed data --------------------------------------------------------------

const networks: NeutronNetwork[] = [
  {
    id: 'net-0001', name: 'public-ext', status: 'ACTIVE', adminStateUp: true,
    shared: true, external: true, mtu: 1500, tenant: 'admin',
    subnets: [
      { id: 'sub-0001', name: 'public-v4', cidr: '203.0.113.0/24', gatewayIp: '203.0.113.1', ipVersion: 4, enableDhcp: false },
    ],
  },
  {
    id: 'net-0002', name: 'mgmt-net', status: 'ACTIVE', adminStateUp: true,
    shared: true, external: false, mtu: 1500, tenant: 'admin',
    subnets: [
      { id: 'sub-0002', name: 'mgmt-v4', cidr: '10.0.0.0/24', gatewayIp: '10.0.0.1', ipVersion: 4, enableDhcp: true },
    ],
  },
  {
    id: 'net-0003', name: 'tenant-a-net', status: 'ACTIVE', adminStateUp: true,
    shared: false, external: false, mtu: 1450, tenant: 'project-a',
    subnets: [
      { id: 'sub-0003', name: 'a-v4', cidr: '192.168.10.0/24', gatewayIp: '192.168.10.1', ipVersion: 4, enableDhcp: true },
      { id: 'sub-0004', name: 'a-v6', cidr: 'fd00:a::/64', gatewayIp: 'fd00:a::1', ipVersion: 6, enableDhcp: true },
    ],
  },
  {
    id: 'net-0004', name: 'tenant-b-net', status: 'ACTIVE', adminStateUp: true,
    shared: false, external: false, mtu: 1450, tenant: 'project-b',
    subnets: [
      { id: 'sub-0005', name: 'b-v4', cidr: '192.168.20.0/24', gatewayIp: '192.168.20.1', ipVersion: 4, enableDhcp: true },
    ],
  },
  {
    id: 'net-0005', name: 'storage-net', status: 'ACTIVE', adminStateUp: true,
    shared: true, external: false, mtu: 9000, tenant: 'admin',
    subnets: [
      { id: 'sub-0006', name: 'storage-v4', cidr: '10.20.0.0/22', gatewayIp: '10.20.0.1', ipVersion: 4, enableDhcp: false },
    ],
  },
  {
    id: 'net-0006', name: 'dmz-net', status: 'DOWN', adminStateUp: false,
    shared: false, external: false, mtu: 1500, tenant: 'project-sec',
    subnets: [
      { id: 'sub-0007', name: 'dmz-v4', cidr: '172.16.0.0/24', gatewayIp: '172.16.0.1', ipVersion: 4, enableDhcp: true },
    ],
  },
  {
    id: 'net-0007', name: 'tenant-c-net', status: 'BUILD', adminStateUp: true,
    shared: false, external: false, mtu: 1450, tenant: 'project-c',
    subnets: [],
  },
  {
    id: 'net-0008', name: 'legacy-net', status: 'ERROR', adminStateUp: true,
    shared: false, external: false, mtu: 1500, tenant: 'project-legacy',
    subnets: [
      { id: 'sub-0008', name: 'legacy-v4', cidr: '192.168.99.0/24', gatewayIp: '192.168.99.1', ipVersion: 4, enableDhcp: true },
    ],
  },
];

const routers: Router[] = [
  { id: 'rtr-0001', name: 'edge-router-01', status: 'ACTIVE', ha: true, externalGateway: 'public-ext', tenant: 'admin' },
  { id: 'rtr-0002', name: 'tenant-a-router', status: 'ACTIVE', ha: false, externalGateway: 'public-ext', tenant: 'project-a' },
  { id: 'rtr-0003', name: 'tenant-b-router', status: 'ACTIVE', ha: false, externalGateway: 'public-ext', tenant: 'project-b' },
  { id: 'rtr-0004', name: 'dmz-router', status: 'DOWN', ha: false, externalGateway: 'public-ext', tenant: 'project-sec' },
  { id: 'rtr-0005', name: 'tenant-c-router', status: 'ACTIVE', ha: false, externalGateway: null, tenant: 'project-c' },
];

const floatingIps: FloatingIp[] = [
  { id: 'fip-0001', floatingIp: '203.0.113.10', fixedIp: '192.168.10.24', status: 'ACTIVE', routerId: 'rtr-0002', tenant: 'project-a' },
  { id: 'fip-0002', floatingIp: '203.0.113.11', fixedIp: '192.168.10.31', status: 'ACTIVE', routerId: 'rtr-0002', tenant: 'project-a' },
  { id: 'fip-0003', floatingIp: '203.0.113.12', fixedIp: '192.168.20.14', status: 'ACTIVE', routerId: 'rtr-0003', tenant: 'project-b' },
  { id: 'fip-0004', floatingIp: '203.0.113.13', fixedIp: null, status: 'DOWN', routerId: null, tenant: 'project-b' },
  { id: 'fip-0005', floatingIp: '203.0.113.14', fixedIp: '192.168.20.55', status: 'ACTIVE', routerId: 'rtr-0003', tenant: 'project-b' },
  { id: 'fip-0006', floatingIp: '203.0.113.15', fixedIp: null, status: 'DOWN', routerId: null, tenant: 'project-a' },
  { id: 'fip-0007', floatingIp: '203.0.113.16', fixedIp: '10.0.0.42', status: 'ACTIVE', routerId: 'rtr-0001', tenant: 'admin' },
  { id: 'fip-0008', floatingIp: '203.0.113.17', fixedIp: null, status: 'DOWN', routerId: null, tenant: 'project-sec' },
  { id: 'fip-0009', floatingIp: '203.0.113.18', fixedIp: '192.168.10.77', status: 'ACTIVE', routerId: 'rtr-0002', tenant: 'project-a' },
  { id: 'fip-0010', floatingIp: '203.0.113.19', fixedIp: null, status: 'DOWN', routerId: null, tenant: 'project-c' },
];

/** Deterministic port set per network (dhcp + router iface + N compute ports). */
function buildPorts(): Record<string, Port[]> {
  const owners = ['network:dhcp', 'network:router_interface', 'compute:nova', 'compute:nova'];
  const map: Record<string, Port[]> = {};
  networks.forEach((net, ni) => {
    const count = net.subnets.length === 0 ? 0 : Math.min(2 + net.subnets.length, owners.length);
    const ports: Port[] = [];
    for (let i = 0; i < count; i++) {
      const octet = 16 + ni * 4 + i;
      const base = net.subnets[0]?.cidr.split('/')[0].split('.').slice(0, 3).join('.') ?? '10.0.0';
      ports.push({
        id: `port-${net.id.slice(-4)}-${i}`,
        name: `${net.name}-port-${i}`,
        networkId: net.id,
        deviceOwner: owners[i],
        macAddress: `fa:16:3e:${((ni + 1) * 16 + i).toString(16).padStart(2, '0')}:${(ni * 7 + 3).toString(16).padStart(2, '0')}:${(i * 11 + 5).toString(16).padStart(2, '0')}`,
        status: net.status === 'ACTIVE' ? 'ACTIVE' : net.status === 'BUILD' ? 'BUILD' : 'DOWN',
        fixedIps: net.subnets[0] ? [`${base}.${octet}`] : [],
      });
    }
    map[net.id] = ports;
  });
  return map;
}

const portsByNetwork = buildPorts();

// ---- Selectors (async, latency + outage aware) ------------------------------

export function listNetworks(): Promise<NeutronNetwork[]> {
  return respond(networks.map((n) => ({ ...n })));
}

export function listRouters(): Promise<Router[]> {
  return respond(routers.map((r) => ({ ...r })));
}

export function listFloatingIps(): Promise<FloatingIp[]> {
  return respond(floatingIps.map((f) => ({ ...f })));
}

export function listPorts(networkId: string): Promise<Port[]> {
  return respond((portsByNetwork[networkId] ?? []).map((p) => ({ ...p })));
}

export function getSummary(): Promise<NetworkSummary> {
  const activeNetworks = networks.filter((n) => n.status === 'ACTIVE').length;
  const ports = Object.values(portsByNetwork).reduce((sum, p) => sum + p.length, 0);
  const floatingIpsInUse = floatingIps.filter((f) => f.fixedIp != null).length;

  const hasError = networks.some((n) => n.status === 'ERROR');
  const hasDown = networks.some((n) => n.status === 'DOWN' || n.status === 'BUILD');
  const health: Health = hasError ? 'critical' : hasDown ? 'degraded' : 'healthy';

  return respond({
    networks: networks.length,
    activeNetworks,
    routers: routers.length,
    floatingIps: floatingIps.length,
    floatingIpsInUse,
    ports,
    health,
  });
}
