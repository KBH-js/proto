# AGENTS.md

AI 에이전트(그리고 사람)가 이 레포에서 코드를 쓸 때 지켜야 하는 크로스커팅 규약.
아키텍처·명령어 상세는 [CLAUDE.md](./CLAUDE.md), remote 작성법은 [REMOTES.md](./REMOTES.md), 테스트는 [TESTING.md](./TESTING.md) 참조 — 이 문서는 규약과 게이트만 담는다.

## 게이트 (전부 통과해야 머지 가능)

PR을 올리기 전 로컬에서:

```bash
pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm -r build   # CI verify job과 동일
pnpm test:e2e                          # Playwright E2E (dev 서버 5개 자동 기동)
```

같은 검사가 GitHub Actions(`.github/workflows/ci.yml`)에서 PR마다 강제된다: lint · typecheck · Vitest · 호스트 빌드 · remote 4개 빌드 · E2E.
추가로 Vercel 배포가 성공할 때마다 `.github/workflows/deploy-smoke.yml`이 배포된 URL에 스모크(`pnpm test:smoke` — manifest 해석·remote CORS·부팅)를 돌린다. Preview 배포의 결과는 PR 커밋에 체크로 붙는다.

## 하드 가드레일 (lint/타입이 기계적으로 차단)

- **raw 컬러 금지** — `.ts/.tsx`에 hex/`rgb()`/`hsl()` 리터럴을 쓰면 `local/no-raw-colors`가 error. 색은 토큰 소스(`@proto/shared/theme`, CSS 변수)나 Tailwind 토큰 클래스로만.
- **raw px 금지** — Tailwind arbitrary px(`text-[10px]`)는 `local/no-raw-px`가 error. 공유 스케일 토큰 또는 rem arbitrary 값으로만. (런타임 픽셀 연산은 대상 아님.)
- **i18n 키는 ko/en 양쪽 필수** — `src/i18n/locales/ko.ts`가 소스, `en.ts`는 ko의 타입 미러(`Resources = typeof ko`). 한쪽에만 키를 추가하면 `tsc -b`(= `pnpm build`)가 실패한다.

## Module Federation 필수 규칙 (어기면 런타임에서 깨짐)

- 모든 엔트리는 async boundary: `main.tsx`는 `import('./bootstrap')` 한 줄.
- exposed 모듈이 자기 CSS를 직접 import. `body`/`html` 전역 규칙은 `standalone.css`에만.
- React/ReactDOM은 singleton, host·remote 양쪽 `requiredVersion: '^19.0.0'` 일치.
- 실패한 remote 재시도 래퍼는 `useState`로 보관 (`useMemo` 금지 — React Compiler 캐싱과 충돌).

## 워크플로 규약

- **새 remote 앱은 반드시 `add-remote-app` skill**(`.claude/skills/add-remote-app/SKILL.md`)로 스캐폴딩 — 수동 미러링 금지.
- 커밋은 conventional commits(`feat(scope):`, `fix(scope):` …), 본문은 한국어 허용.
- 문서(CLAUDE.md/REMOTES.md/TESTING.md)가 실제 코드와 어긋나는 변경을 했다면 같은 PR에서 문서도 갱신한다.
