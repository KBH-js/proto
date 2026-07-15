/**
 * OpenStack Nova-flavored resource types for the Compute dashboard.
 * A clean-room, dependency-free domain model shaped after the Compute API
 * v2.1 (servers, flavors, os-hypervisors, os-volume_attachments) — enough
 * surface to exercise a realistic REST UI with TanStack Query.
 */

/** Subset of the Nova server status vocabulary the dataset exercises. */
export type ServerStatus =
  | 'ACTIVE'
  | 'BUILD'
  | 'ERROR'
  | 'SHUTOFF'
  | 'PAUSED'
  | 'RESIZE'
  | 'SHELVED';
/** Human-readable power state (Nova reports these as numeric OS-EXT-STS codes). */
export type PowerState = 'RUNNING' | 'SHUTDOWN' | 'PAUSED' | 'NOSTATE' | 'CRASHED';
export type HypervisorState = 'up' | 'down';
export type HypervisorStatus = 'enabled' | 'disabled';
export type VolumeStatus = 'in-use' | 'available' | 'error';

export interface ServerAddress {
  /** Neutron network name the address lives on */
  network: string;
  ip: string;
  type: 'fixed' | 'floating';
  version: 4 | 6;
}

export interface Server {
  id: string;
  name: string;
  status: ServerStatus;
  powerState: PowerState;
  /** Transient task (e.g. 'spawning', 'resize_migrating'), or null when steady */
  taskState: string | null;
  flavorId: string;
  imageName: string;
  /** Hypervisor hostname (OS-EXT-SRV-ATTR:host) */
  host: string;
  availabilityZone: string;
  /** SSH keypair name, or null when booted without one */
  keyName: string | null;
  locked: boolean;
  tenant: string;
  launchedAt: string;
  addresses: ServerAddress[];
}

export interface Flavor {
  id: string;
  name: string;
  vcpus: number;
  ramMb: number;
  diskGb: number;
  ephemeralGb: number;
  swapMb: number;
  isPublic: boolean;
}

export interface Hypervisor {
  id: string;
  hostname: string;
  /** e.g. QEMU, KVM */
  type: string;
  state: HypervisorState;
  status: HypervisorStatus;
  vcpus: number;
  vcpusUsed: number;
  memoryMb: number;
  memoryMbUsed: number;
  localGb: number;
  localGbUsed: number;
  runningVms: number;
}

export interface VolumeAttachment {
  id: string;
  /** Guest device path, e.g. /dev/vda */
  device: string;
  volumeName: string;
  sizeGb: number;
  bootable: boolean;
  status: VolumeStatus;
}

export type Health = 'healthy' | 'degraded' | 'critical';

export interface ComputeSummary {
  servers: number;
  activeServers: number;
  vcpusUsed: number;
  vcpusTotal: number;
  memoryMbUsed: number;
  memoryMbTotal: number;
  hypervisors: number;
  hypervisorsUp: number;
  health: Health;
}
