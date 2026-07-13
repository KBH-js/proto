# CLAUDE.md

pnpm workspace 모노레포. Host(웹 데스크탑 셸, 루트 `src/`)가 Module Federation 2.x **런타임 API**로 Remote 앱들(`packages/remote-calculator`, `packages/remote-notes`, `packages/remote-network`)을 동적 등록·로딩한다. 빌드는 전부 Rsbuild(Rspack). 테스트는 Vitest+MSW(`pnpm test`).

## Commands

Host (루트):

```bash
pnpm dev          # http://localhost:5173
pnpm dev:remotes  # 모든 remote를 dev 모드로 병렬 실행 (:5001, :5002)
pnpm build        # tsc -b && rsbuild build
pnpm lint         # eslint . (호스트에만 lint 스크립트 있음)
pnpm preview
```

Remote (각 `packages/remote-*`): `pnpm dev` — Rsbuild MF 플러그인은 dev 모드에서 컨테이너를 바로 서빙한다 (build+preview 불필요).

## Module Federation 구조 (중요)

- Host는 빌드 타임에 **remote를 선언하지 않는다**. 부팅 시 `public/remotes.manifest.json`을 fetch → `registerRemotes()` 런타임 등록 (`src/federation/runtime.ts`, `src/federation/catalog.ts`).
- Remote 추가/이동은 manifest 수정으로 끝난다 — Host 재빌드 불필요. dev에선 `devEntryUrl`, prod에선 `entryUrl`(각 remote의 `mf-manifest.json`) 사용.
- 모든 엔트리는 async boundary 필수: `main.tsx`는 `import('./bootstrap')` 한 줄. 어기면 "loadShareSync failed" 에러.
- **exposed 모듈이 자기 CSS를 직접 import**해야 호스트에서 스타일이 주입된다. `body`/`html` 전역 규칙은 `standalone.css`(standalone 엔트리 전용)에만 — exposed 그래프에 넣으면 호스트 document를 오염시킨다.
- Remote 로드 실패는 해당 창의 ErrorBoundary에 격리된다. **Try Again** = `registerRemotes([...], { force: true })`로 컨테이너 캐시 초기화 + 새 `React.lazy` 래퍼 교체. 래퍼는 반드시 `useState`로 보관 — `useMemo`는 React Compiler가 재계산을 건너뛰어 캐시된 rejection이 재사용된다 (WindowFrame.tsx).
- React/ReactDOM은 singleton 공유, `requiredVersion: '^19.0.0'` 양쪽 일치 필수.
- Remote dev 서버는 절대 URL `dev.assetPrefix` 필수 (cross-origin 청크 로드). prod는 `ASSET_PREFIX` env.
- React Compiler는 호스트에만, `@rsbuild/plugin-babel`(pluginReact보다 앞) 경유.

## Architecture

- `src/federation/` — MF 런타임 헬퍼(`runtime.ts`: registerAppRemotes/forceRefreshRemote/loadRemoteComponent)와 카탈로그 fetch/검증(`catalog.ts`).
- `src/registry/appRegistry.ts` — zustand 스토어. 로컬 앱은 정적 시드, remote 앱은 `initializeAppRegistry()`가 manifest에서 머지. `status: loading|ready|degraded` — manifest 실패 시 로컬 앱만 노출(크래시 금지).
- `src/store/windowStore.ts` — Zustand 전역 스토어(`persist`로 localStorage에 창 배치 저장). 창 열기(싱글 인스턴스 + cascade)/닫기/포커스(zIndex 정규화)/최소화/최대화/Aero 스냅/이동/리사이즈. 지오메트리 계산은 `src/utils/windowGeometry.ts` 공유(스냅 rect, 엣지 감지, viewport clamp — rehydrate/resize 재사용).
- `src/components/` — atomic design (atoms/molecules/organisms/templates/shared). `organisms/WindowFrame.tsx`가 react-rnd 기반 창 본체 + remote lazy 로딩/재시도 소유.
- `src/config/portfolio.config.ts` — 소유자 정보, 소셜 링크, 이력서 URL 등 포트폴리오 설정.
- `packages/shared` — 디자인 토큰(`theme.js` + `theme.d.ts`)만 export(`@proto/shared/theme`)하는 패키지, 빌드 스텝 없음. remote들은 독립 배포를 위해 로컬 복사본(`src/theme.js`) 사용. 호스트는 이 단일 소스를 직접 소비(Desktop wallpaper, Design Tokens 앱).
- `packages/remote-network` — OpenStack Neutron 네트워크 대시보드 remote(포트 5003). MSW-mockable `fetch` REST(호스트 임베드 시 cross-origin SW 불가 → 인메모리 폴백; 표준은 Vitest node로 검증) + **TanStack Query**(캐싱/로딩/에러/장애 주입). i18n은 remote-local 사전 + `useHostLocale`(아래 브리지), 테마는 `.remote-network` 스코프 CSS-변수 토큰으로 호스트 `.dark`에 반응.
- `src/federation/hostBridge.ts` — prefs→remote 브리지. locale/theme 변화를 `window.__PROTO_LOCALE__`/`__PROTO_THEME__` 시드 + `host:locale-changed`/`host:theme-changed` CustomEvent로 발행(`bootstrap.tsx`에서 1회 init). 독립 빌드 remote가 호스트 i18n/테마를 import하지 않고 소비하는 경로.
- `src/apps/DesignTokensApp.tsx` + `designTokens.ts` — 3-layer(primitive→semantic→component) 토큰 갤러리 로컬 앱. `@proto/shared/theme` 단일 소스에서 파생.
- **토큰 가드레일**: `eslint-rules/no-raw-colors.js`(`local/no-raw-colors`)가 `.ts/.tsx`의 raw hex/rgb/hsl을 error로 차단. 색은 토큰 소스(`theme.js`, CSS 변수)·Tailwind 토큰 클래스에서만. 예외: `src/store/toastStore.ts`(콘솔 `%c` 아트, config 오버라이드).

## 새 Remote 추가 절차

1. `packages/remote-notes`를 미러링해 패키지 생성 — rsbuild.config.ts(`name`, `exposes`, singleton `shared`, `dts: false`, 고유 포트, `dev.assetPrefix`), async boundary 엔트리, exposed 모듈에 `import './index.css'`.
2. `public/remotes.manifest.json`에 앱 엔트리 추가 — **호스트 코드 수정 없음**. 아이콘이 새 이름이면 `DesktopIcon.tsx`/`TaskbarItem.tsx`의 iconMap에 추가.
3. 배포 시: 새 Vercel 프로젝트(root: 해당 패키지), CORS 헤더 유지(vercel.json), `ASSET_PREFIX` env 설정 후 manifest의 `entryUrl` 갱신.

상세 문서: [REMOTES.md](./REMOTES.md)
