/**
 * OpenStack Neutron-flavored resource types for the Network dashboard.
 * A clean-room, dependency-free domain model — enough surface to exercise a
 * realistic REST UI (nested resources, statuses, relations) with TanStack Query.
 */

export type NetworkStatus = 'ACTIVE' | 'DOWN' | 'BUILD' | 'ERROR';
export type RouterStatus = 'ACTIVE' | 'DOWN';
export type FloatingIpStatus = 'ACTIVE' | 'DOWN';
export type PortStatus = 'ACTIVE' | 'DOWN' | 'BUILD';

export interface Subnet {
  id: string;
  name: string;
  cidr: string;
  gatewayIp: string;
  ipVersion: 4 | 6;
  enableDhcp: boolean;
}

export interface NeutronNetwork {
  id: string;
  name: string;
  status: NetworkStatus;
  adminStateUp: boolean;
  shared: boolean;
  external: boolean;
  mtu: number;
  tenant: string;
  subnets: Subnet[];
}

export interface Router {
  id: string;
  name: string;
  status: RouterStatus;
  ha: boolean;
  /** Name of the external gateway network, or null if unattached */
  externalGateway: string | null;
  tenant: string;
}

export interface FloatingIp {
  id: string;
  floatingIp: string;
  /** The fixed IP it maps to, or null when unassociated */
  fixedIp: string | null;
  status: FloatingIpStatus;
  routerId: string | null;
  tenant: string;
}

export interface Port {
  id: string;
  name: string;
  networkId: string;
  /** e.g. compute:nova, network:router_interface, network:dhcp */
  deviceOwner: string;
  macAddress: string;
  status: PortStatus;
  fixedIps: string[];
}

export type Health = 'healthy' | 'degraded' | 'critical';

export interface NetworkSummary {
  networks: number;
  activeNetworks: number;
  routers: number;
  floatingIps: number;
  floatingIpsInUse: number;
  ports: number;
  health: Health;
}
