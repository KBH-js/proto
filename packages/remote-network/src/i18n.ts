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
  title: '네트워크 대시보드',
  subtitle: 'OpenStack Neutron · 가상 네트워크 컨트롤 플레인',
  refresh: '새로고침',
  simulateOutage: '장애 주입',
  outageArmed: '장애 주입됨',
  demoData: '데모 시드 데이터',
  // summary
  sumNetworks: '네트워크',
  sumActive: '활성',
  sumRouters: '라우터',
  sumFloatingIps: '플로팅 IP',
  sumInUse: '사용 중',
  sumPorts: '포트',
  sumHealth: '헬스',
  healthy: '정상',
  degraded: '주의',
  critical: '위험',
  // network table
  colName: '이름',
  colStatus: '상태',
  colType: '유형',
  colSubnets: '서브넷',
  typeExternal: '외부',
  typeShared: '공유',
  typeTenant: '테넌트',
  // detail
  selectPrompt: '왼쪽에서 네트워크를 선택하세요',
  detailSubnets: '서브넷',
  detailPorts: '포트',
  colCidr: 'CIDR',
  colGateway: '게이트웨이',
  dhcpOn: 'DHCP',
  colMac: 'MAC 주소',
  colOwner: '소유자',
  colFixedIps: '고정 IP',
  mtu: 'MTU',
  tenant: '테넌트',
  // tabs
  tabRouters: '라우터',
  tabFloatingIps: '플로팅 IP',
  colHa: 'HA',
  colExtGateway: '외부 게이트웨이',
  colFloatingIp: '플로팅 IP',
  colFixedIp: '고정 IP',
  unassociated: '미할당',
  // states
  loading: '불러오는 중…',
  errorTitle: '데이터를 불러오지 못했습니다',
  errorBody: 'Neutron 컨트롤 플레인에 연결할 수 없습니다. 장애 주입을 해제하고 다시 시도하세요.',
  retry: '다시 시도',
  empty: '항목 없음',
};

// ko is the source shape; its value types widen to `string` (no `as const`),
// so `en` can mirror it and stay type-checked against the same key set.
type Dict = typeof ko;

const en: Dict = {
  title: 'Network Dashboard',
  subtitle: 'OpenStack Neutron · virtual network control plane',
  refresh: 'Refresh',
  simulateOutage: 'Simulate outage',
  outageArmed: 'Outage armed',
  demoData: 'Demo seed data',
  sumNetworks: 'Networks',
  sumActive: 'Active',
  sumRouters: 'Routers',
  sumFloatingIps: 'Floating IPs',
  sumInUse: 'In use',
  sumPorts: 'Ports',
  sumHealth: 'Health',
  healthy: 'Healthy',
  degraded: 'Degraded',
  critical: 'Critical',
  colName: 'Name',
  colStatus: 'Status',
  colType: 'Type',
  colSubnets: 'Subnets',
  typeExternal: 'External',
  typeShared: 'Shared',
  typeTenant: 'Tenant',
  selectPrompt: 'Select a network on the left',
  detailSubnets: 'Subnets',
  detailPorts: 'Ports',
  colCidr: 'CIDR',
  colGateway: 'Gateway',
  dhcpOn: 'DHCP',
  colMac: 'MAC address',
  colOwner: 'Owner',
  colFixedIps: 'Fixed IPs',
  mtu: 'MTU',
  tenant: 'Tenant',
  tabRouters: 'Routers',
  tabFloatingIps: 'Floating IPs',
  colHa: 'HA',
  colExtGateway: 'External gateway',
  colFloatingIp: 'Floating IP',
  colFixedIp: 'Fixed IP',
  unassociated: 'Unassociated',
  loading: 'Loading…',
  errorTitle: 'Failed to load data',
  errorBody:
    'Cannot reach the Neutron control plane. Disable the simulated outage and try again.',
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
