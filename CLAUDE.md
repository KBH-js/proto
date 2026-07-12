# CLAUDE.md

pnpm workspace 모노레포. Host(웹 데스크탑 셸, 루트 `src/`)가 Module Federation으로 Remote 앱(`packages/remote-calculator`)을 런타임에 로딩한다. 테스트는 없다.

## Commands

Host (루트):

```bash
pnpm dev        # http://localhost:5173
pnpm build      # tsc -b && vite build
pnpm lint       # eslint . (호스트에만 lint 스크립트 있음)
pnpm preview
```

Remote (`packages/remote-calculator`):

```bash
pnpm build && pnpm preview   # http://localhost:5001
```

## Module Federation 제약 (중요)

- `@originjs/vite-plugin-federation`은 Remote를 dev 모드로 서빙하지 못한다. Remote는 반드시 `build && preview`로 띄우고, **Host보다 먼저** 실행해야 한다.
- Remote 코드 변경은 재빌드(`pnpm build && pnpm preview`)해야 Host에 반영된다.
- Remote 로딩 실패 후 재시도는 페이지 새로고침이 필요하다 (federation 런타임/브라우저 캐싱).
- React/ReactDOM은 singleton으로 공유되며 Host와 Remote의 `requiredVersion`(`^19.0.0`)이 일치해야 한다. Host는 `generate: true`, Remote는 `generate: false`.
- 양쪽 vite config 모두 `build.target: 'esnext'` 필수 (top-level await).
- Remote의 프로덕션 URL은 Host 빌드 시 `VITE_REMOTE_CALCULATOR_URL` 환경변수로 주입 (미설정 시 localhost:5001). Host와 Remote는 별도의 Vercel 프로젝트로 배포된다.

## Architecture

- `src/store/windowStore.ts` — Zustand 전역 스토어. 창 열기/닫기/포커스(z-index)/최소화/최대화/이동/리사이즈.
- `src/registry/appRegistry.ts` — componentType 문자열 → 컴포넌트/기본 설정 매핑. 앱 추가는 여기에 엔트리를 등록하는 것으로 끝난다. `externalUrl`만 있는 엔트리(Resume)는 창 대신 외부 링크로 열린다.
- `src/components/` — atomic design (atoms/molecules/organisms/templates/shared). `organisms/WindowFrame.tsx`가 react-rnd 기반 창 본체.
- `src/config/portfolio.config.ts` — 소유자 정보, 소셜 링크, 이력서 URL 등 포트폴리오 설정.
- `src/remotes.d.ts` — remote 모듈 import에 대한 타입 선언.
- `packages/shared` — 디자인 토큰(`theme.js`)만 export하는 패키지, 빌드 스텝 없음.

## 새 Remote 추가 절차

1. `packages/remote-<name>`에 Vite + federation 설정으로 패키지 생성 — `name`, `filename: 'remoteEntry.js'`, `exposes`, singleton `shared` 설정. 고유 포트 사용 (`strictPort`, `cors: true`).
2. Host `vite.config.ts`의 `remotes`에 entry URL 등록.
3. `src/remotes.d.ts`에 모듈 선언 추가.
4. `src/registry/appRegistry.ts`에 `lazy(() => import('remote<Name>/...'))` 엔트리 추가 (`isRemote: true`).
