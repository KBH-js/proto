/**
 * Korean resource bundle (the source locale).
 *
 * Keys are dot-addressed (`t('taskbar.apps')`). Values may contain `{{var}}`
 * placeholders interpolated by `t(key, params)`. `en.ts` mirrors this shape
 * exactly (enforced by the shared `Resources` type).
 */
export const ko = {
  app: {
    about: '소개',
    resume: '이력서',
    inspector: '인스펙터',
    calculator: '계산기',
    notes: '메모',
    network: '네트워크',
    tokens: '디자인 토큰',
  },
  taskbar: {
    startMenu: '시작 메뉴',
    apps: '앱',
    connect: '연결',
    noWindows: '열린 창 없음',
    githubDesc: '소스 코드 보기',
    linkedinDesc: '프로필 보기',
    email: '이메일',
    emailDesc: '연락하기',
    copyEmail: '이메일 주소 복사',
    emailCopied: '이메일 주소가 클립보드에 복사되었습니다.',
    copyFailed: '복사에 실패했습니다.',
    toDark: '다크 모드로 전환',
    toLight: '라이트 모드로 전환',
    toEnglish: 'English로 전환',
    toKorean: '한국어로 전환',
    federationStrip: 'Module Federation · remote {{count}}개 · React {{version}}',
    openInspector: '페더레이션 인스펙터 열기',
  },
  window: {
    close: '창 닫기',
    minimize: '창 최소화',
    maximize: '창 최대화',
    loading: '{{title}} 불러오는 중...',
    notFound: '앱을 찾을 수 없음: {{type}}',
    remoteLoaded: "원격 모듈 '{{module}}'을(를) {{ms}}ms에 불러왔습니다",
    mfeDevTooltip: 'Module Federation — 개발 (localhost)',
    mfeProdTooltip: 'Module Federation — Vercel에서 로드됨',
  },
  boot: {
    init: 'KBH-Desktop v1.0.0 초기화 중...',
    loadingRemotes: 'Module Federation으로 원격 모듈 로딩 중...',
    startingWm: '윈도우 매니저 시작 중...',
    ready: '시스템 준비 완료.',
    subtitle: 'Micro-Frontend 아키텍처 데모',
  },
  error: {
    unavailable: '{{appName}}을(를) 현재 사용할 수 없습니다',
    body: '원격 애플리케이션을 불러오지 못했습니다. 원격 서비스가 실행 중인지 확인한 뒤 다시 시도하세요 — 이 창만 영향을 받습니다.',
    details: '기술 세부정보',
    tryAgain: '다시 시도',
    closeWindow: '창 닫기',
    catalogFailed: '원격 앱 카탈로그를 불러오지 못했습니다 — 로컬 앱만 사용 가능',
  },
  loading: {
    generic: '불러오는 중...',
  },
  toast: {
    dismiss: '알림 닫기',
  },
  resume: {
    filename: 'Resume.pdf',
    openNewTab: '새 탭에서 열기',
    download: '다운로드',
  },
  inspector: {
    title: '페더레이션 인스펙터',
    subtitle: '런타임 Module Federation 상태 · 실패 복구 데모',
    reactSingleton: 'React 싱글턴',
    singletonCaption: '한 번 협상되어 모든 remote가 공유',
    registryStatus: '레지스트리 상태',
    statusLoading: '로딩 중',
    statusReady: '준비',
    statusDegraded: '저하됨',
    noRemotes: '등록된 remote가 없습니다',
    colApp: '원격 앱',
    colEntry: '엔트리 URL',
    colStatus: '상태',
    colLoadTime: '로드 시간',
    colLoads: '로드',
    dev: 'DEV',
    prod: 'PROD',
    stRegistered: '등록됨',
    stLoading: '로딩 중',
    stLoaded: '로드됨',
    stError: '오류',
    stChaos: '장애 주입됨',
    break: '장애 주입',
    breakTitle: '이 remote를 불량 URL로 재등록하고 창을 다시 열어 실패→복구 흐름을 시연합니다',
    healAll: '전체 복구',
    healAllTitle: '모든 remote를 정상 엔트리로 재등록합니다',
    openApp: '앱 열기',
    chaosToast: "'{{name}}' 컨테이너를 오염시켰습니다 — 열린 창에서 다시 시도로 복구하세요",
    healToast: '모든 remote를 정상 엔트리로 복구했습니다',
    notLoaded: '—',
    explainer:
      '각 remote는 런타임에 매니페스트에서 주입된 URL로 등록됩니다. 장애 주입은 재배포 후 stale chunk 상황을 재현하며, 실패한 창만 격리되어 복구됩니다.',
  },
  tokens: {
    title: '디자인 토큰',
    subtitle: '3-레이어 토큰 파이프라인 · raw 컬러는 lint로 차단',
    guardTitle: '토큰 가드레일',
    guardBody:
      'raw 컬러(hex/rgb/hsl)는 eslint 룰(local/no-raw-colors)로 차단됩니다. 모든 색은 단일 토큰 소스(@proto/shared/theme)에서만 나옵니다.',
    layerPrimitive: '프리미티브',
    layerPrimitiveDesc: '원시 팔레트 값',
    layerSemantic: '시맨틱',
    layerSemanticDesc: '역할 기반 별칭',
    layerComponent: '컴포넌트',
    layerComponentDesc: '컴포넌트가 소비하는 토큰',
  },
  about: {
    subtitle: 'Module Federation 웹 데스크톱 · 실행 가능한 이력서',
    honesty:
      '사내 실프로젝트의 clean-room 재현입니다. 코드는 반출할 수 없어 아키텍처와 절차만 다시 세웠고, 아래 “라이브”로 표시된 것은 이 화면에서 실제로 실행됩니다.',
    claimsTitle: '주장 → 증거',
    claimsCaption: '이력서의 각 항목을 실제로 도는 데모로 연결합니다. 행을 누르면 해당 기능이 열립니다.',
    tagLive: '라이브',
    tagPartial: '부분',
    tagPlanned: '예정',
    claim: {
      federation: {
        title: '런타임 동적 Remote URL 주입 + 독립 배포',
        desc: 'Host는 빌드 타임에 remote를 선언하지 않습니다. 부팅 시 매니페스트를 fetch해 registerRemotes()로 런타임 등록합니다. 이력서의 13개 앱은 여기선 대표 2개(Calculator·Notes)로 각각 독립 배포됩니다.',
      },
      recovery: {
        title: '재배포 후 stale-chunk 복구 — 실패한 프레임만',
        desc: "Inspector의 '장애 주입'은 재배포로 청크가 깨진 상황을 재현합니다. 실패는 해당 창의 ErrorBoundary에만 격리되고, '다시 시도'가 컨테이너 캐시를 초기화해 그 창만 복구합니다.",
      },
      singleton: {
        title: 'React 19 싱글턴 공유',
        desc: 'React/ReactDOM은 한 번 협상되어 모든 remote가 공유합니다. Inspector가 현재 협상된 단일 버전을 보여줍니다.',
      },
      i18n: {
        title: 'i18n ko/en 파이프라인 · 누락 키 차단',
        desc: 'ko가 소스, en은 ko의 타입 미러라 키가 빠지면 컴파일 에러입니다 — CI 누락 키 체크의 프로토 아날로그. 트레이의 언어 버튼으로 지금 전환해 보세요.',
      },
      theming: {
        title: '디자인 토큰 + 다크 모드',
        desc: '테마는 셸 루트의 class 토글이고 토큰은 shared 패키지에서 옵니다. 트레이의 테마 버튼으로 전환됩니다. (Storybook 라이트/다크 VRT 매트릭스는 예정)',
      },
      testing: {
        title: 'Vitest / MSW 통합 테스트',
        desc: '카탈로그·윈도우 스토어·지오메트리에 대한 단위+통합 테스트를 pnpm test로 실행합니다. (Playwright E2E ~160개는 예정)',
      },
      compiler: {
        title: 'React Compiler 마이그레이션',
        desc: 'Host는 React Compiler를 씁니다. remote 재시도 래퍼를 useMemo가 아닌 useState로 둔 이유가 그것 — Compiler가 재계산을 건너뛰어 캐시된 rejection이 재사용되기 때문입니다.',
      },
      domain: {
        title: '가상 스크롤 · 디바운스 검색 · 클라이언트 캐싱',
        desc: '대용량 리스트 최적화 경력. Tier 2 도메인 remote 앱에서 재현 예정 — 아직 이 데모엔 없습니다.',
      },
      aidx: {
        title: 'AI 개발 워크플로 규약',
        desc: '레포의 CLAUDE.md 팀 규약과 lint 게이트로 에이전트 작업을 제약합니다. 훅 기반 CI 차단·검증 Skill은 부분 재현입니다.',
      },
    },
    act: {
      inspector: '인스펙터에서 보기',
      source: '소스 보기',
      theme: '테마 전환',
      locale: '언어 전환',
      test: '테스트 소스',
    },
    decisionsTitle: '기술 결정 · 트레이드오프',
    decision: {
      runtime: {
        title: '빌드타임이 아닌 런타임 등록',
        desc: 'remote 추가·이동이 매니페스트 수정으로 끝나고 Host 재빌드가 필요 없습니다. 대가로 타입 안전한 정적 import를 포기합니다.',
      },
      recovery: {
        title: '창 단위 격리 + fresh lazy 래퍼',
        desc: 'React.lazy는 거부된 프로미스를 영구 캐시하므로 재시도는 새 래퍼를 만들어야 합니다. 래퍼를 useState에 보관해 React Compiler 메모이제이션을 넘깁니다.',
      },
      css: {
        title: 'Exposed 모듈이 자기 CSS를 import',
        desc: '그래야 스타일이 호스트에 주입됩니다. body/html 전역 규칙은 standalone 엔트리에만 둬서 호스트 document 오염을 막습니다.',
      },
      singleton: {
        title: 'React 싱글턴 버전 일치',
        desc: 'Host와 remote가 requiredVersion ^19를 공유해 두 개의 React가 로드되는 것을 막습니다.',
      },
    },
    linksTitle: '배포 · 소스',
    linksCaption: '실제로 배포되어 이 데스크톱이 런타임에 로드합니다.',
    link: {
      host: 'Host (웹 데스크톱)',
      calculator: 'Remote · Calculator',
      notes: 'Remote · Notes',
      repo: '소스 저장소',
    },
    shortcutsTitle: '키보드 단축키',
    shortcut: {
      about: '소개 열기',
      inspector: '인스펙터 열기',
      theme: '테마 전환',
      locale: '언어 전환',
      tour: '가이드 투어',
    },
    stackTitle: '기술 스택',
    replayTour: '가이드 투어 다시 보기',
  },
  tour: {
    next: '다음',
    back: '이전',
    skip: '건너뛰기',
    done: '시작하기',
    progress: '{{current}} / {{total}}',
    step: {
      welcome: {
        title: 'KBH-Desktop에 오신 것을 환영합니다',
        body: 'Module Federation으로 만든 웹 데스크톱입니다. 사내 실프로젝트의 clean-room 재현 — 여기 보이는 것은 실제로 실행됩니다. 30초만 둘러보세요.',
      },
      calculator: {
        title: '원격 앱을 실행해 보세요',
        body: 'Calculator를 클릭하면 별도로 배포된 remote-calculator에서 로드됩니다. 로드 시간이 토스트로, 타이틀바엔 MFE 배지가 표시됩니다.',
      },
      inspector: {
        title: '런타임을 들여다보기',
        body: "Federation Inspector는 각 remote의 주입된 URL·로드 시간을 보여주고, '장애 주입'으로 실패→복구 흐름을 직접 시연합니다.",
      },
      tray: {
        title: '언어 · 테마 · 상태',
        body: '여기서 한국어/영어와 다크/라이트를 전환하고, 현재 연결된 remote 개수를 확인합니다.',
      },
      done: {
        title: '준비 완료',
        body: '소개(About) 앱에서 이력서 주장이 어떤 데모로 증명되는지 확인하세요. 이 투어는 언제든 다시 볼 수 있습니다.',
      },
    },
  },
};
