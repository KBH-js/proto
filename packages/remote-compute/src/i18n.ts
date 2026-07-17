import { useSyncExternalStore } from 'react';

/**
 * Remote-local i18n with a host-driven locale (bridge strategy "a").
 *
 * A federated remote is an independent build, so it cannot import the host's
 * `useTranslation`. Instead it owns its domain dictionary here, but takes the
 * ACTIVE LOCALE from the host: the host seeds `window.__PROTO_LOCALE__` and
 * dispatches `host:locale-changed` on every toggle (see host
 * src/federation/hostBridge.ts). `useHostLocale` subscribes to that event, so
 * flipping the shell's language re-renders this remote in sync.
 */

export type Locale = 'ko' | 'en';

const ko = {
  title: '컴퓨트 대시보드',
  subtitle: 'OpenStack Nova · 가상 머신 컨트롤 플레인',
  refresh: '새로고침',
  simulateOutage: '장애 주입',
  outageArmed: '장애 주입됨',
  demoData: '데모 시드 데이터',
  // summary
  sumInstances: '인스턴스',
  sumActive: '활성',
  sumVcpus: 'vCPU',
  sumMemory: '메모리',
  sumHypervisors: '하이퍼바이저',
  sumUp: '가동 중',
  sumHealth: '헬스',
  healthy: '정상',
  degraded: '주의',
  critical: '위험',
  // server table
  colName: '이름',
  colStatus: '상태',
  tagLocked: '잠김',
  // detail
  selectPrompt: '왼쪽에서 인스턴스를 선택하세요',
  detailSpec: '사양',
  detailAddresses: '주소',
  detailVolumes: '볼륨',
  specFlavor: '플레이버',
  specImage: '이미지',
  specAz: '가용 영역',
  specHost: '호스트',
  specPower: '전원 상태',
  specKeypair: '키페어',
  specLaunched: '시작 시각',
  colNetwork: '네트워크',
  colIp: 'IP 주소',
  colType: '유형',
  typeFixed: '고정',
  typeFloating: '플로팅',
  colDevice: '디바이스',
  colVolumeName: '볼륨 이름',
  colSize: '크기',
  colBootable: '부팅',
  // tabs
  tabHypervisors: '하이퍼바이저',
  tabFlavors: '플레이버',
  colState: '가동',
  colAdmin: '관리 상태',
  colVcpus: 'vCPU',
  colMemory: '메모리',
  colVms: 'VM',
  colRam: 'RAM',
  colDisk: '디스크',
  colPublic: '공개',
  tenant: '테넌트',
  // states
  loading: '불러오는 중…',
  errorTitle: '데이터를 불러오지 못했습니다',
  errorBody: 'Nova 컨트롤 플레인에 연결할 수 없습니다. 장애 주입을 해제하고 다시 시도하세요.',
  retry: '다시 시도',
  empty: '항목 없음',
};

// ko is the source shape; its value types widen to `string` (no `as const`),
// so `en` can mirror it and stay type-checked against the same key set.
type Dict = typeof ko;

const en: Dict = {
  title: 'Compute Dashboard',
  subtitle: 'OpenStack Nova · virtual machine control plane',
  refresh: 'Refresh',
  simulateOutage: 'Simulate outage',
  outageArmed: 'Outage armed',
  demoData: 'Demo seed data',
  sumInstances: 'Instances',
  sumActive: 'Active',
  sumVcpus: 'vCPUs',
  sumMemory: 'Memory',
  sumHypervisors: 'Hypervisors',
  sumUp: 'Up',
  sumHealth: 'Health',
  healthy: 'Healthy',
  degraded: 'Degraded',
  critical: 'Critical',
  colName: 'Name',
  colStatus: 'Status',
  tagLocked: 'Locked',
  selectPrompt: 'Select an instance on the left',
  detailSpec: 'Spec',
  detailAddresses: 'Addresses',
  detailVolumes: 'Volumes',
  specFlavor: 'Flavor',
  specImage: 'Image',
  specAz: 'Availability zone',
  specHost: 'Host',
  specPower: 'Power state',
  specKeypair: 'Key pair',
  specLaunched: 'Launched',
  colNetwork: 'Network',
  colIp: 'IP address',
  colType: 'Type',
  typeFixed: 'Fixed',
  typeFloating: 'Floating',
  colDevice: 'Device',
  colVolumeName: 'Volume name',
  colSize: 'Size',
  colBootable: 'Bootable',
  tabHypervisors: 'Hypervisors',
  tabFlavors: 'Flavors',
  colState: 'State',
  colAdmin: 'Admin',
  colVcpus: 'vCPUs',
  colMemory: 'Memory',
  colVms: 'VMs',
  colRam: 'RAM',
  colDisk: 'Disk',
  colPublic: 'Public',
  tenant: 'Tenant',
  loading: 'Loading…',
  errorTitle: 'Failed to load data',
  errorBody: 'Cannot reach the Nova control plane. Disable the simulated outage and try again.',
  retry: 'Retry',
  empty: 'No items',
};

const dictionaries: Record<Locale, Dict> = { ko, en };

const LOCALE_EVENT = 'host:locale-changed';

function subscribe(onChange: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener(LOCALE_EVENT, onChange);
  return () => window.removeEventListener(LOCALE_EVENT, onChange);
}

function getSnapshot(): Locale {
  if (typeof window === 'undefined') return 'ko';
  return window.__PROTO_LOCALE__ === 'en' ? 'en' : 'ko';
}

/** Reactive host locale — re-renders on `host:locale-changed`. */
export function useHostLocale(): Locale {
  return useSyncExternalStore(subscribe, getSnapshot, () => 'ko');
}

export type TFunction = (key: keyof Dict) => string;

/** Translation hook bound to the host locale. */
export function useT(): { t: TFunction; locale: Locale } {
  const locale = useHostLocale();
  const dict = dictionaries[locale];
  return { t: (key) => dict[key], locale };
}
