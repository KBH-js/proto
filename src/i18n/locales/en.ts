import type { ko } from './ko';

/**
 * English resource bundle. Its shape is type-checked against `ko` (the source
 * locale) via `Resources`, so a missing/renamed key is a compile error.
 */
export type Resources = typeof ko;

export const en: Resources = {
  app: {
    about: 'About',
    resume: 'Resume',
    inspector: 'Inspector',
    calculator: 'Calculator',
    notes: 'Notes',
    network: 'Network',
    compute: 'Compute',
    tokens: 'Design Tokens',
  },
  taskbar: {
    startMenu: 'Start Menu',
    apps: 'Apps',
    connect: 'Connect',
    githubDesc: 'View source code',
    linkedinDesc: 'Professional profile',
    email: 'Email',
    emailDesc: 'Get in touch',
    copyEmail: 'Copy email address',
    emailCopied: 'Email address copied to clipboard.',
    copyFailed: 'Failed to copy.',
    toDark: 'Switch to dark mode',
    toLight: 'Switch to light mode',
    toEnglish: 'Switch to English',
    toKorean: 'Switch to Korean',
    federationStrip: 'Module Federation · {{count}} remotes · React {{version}}',
    openInspector: 'Open Federation Inspector',
  },
  window: {
    close: 'Close window',
    minimize: 'Minimize window',
    maximize: 'Maximize window',
    loading: 'Loading {{title}}...',
    notFound: 'App not found: {{type}}',
    remoteLoaded: "Remote module '{{module}}' loaded in {{ms}}ms",
    mfeDevTooltip: 'Module Federation — Development (localhost)',
    mfeProdTooltip: 'Module Federation — Loaded from Vercel',
  },
  boot: {
    init: 'Initializing KBH-Desktop v1.0.0...',
    subtitle: 'Micro-Frontend Architecture Demo',
  },
  error: {
    unavailable: '{{appName}} is currently unavailable',
    body: 'The remote application could not be loaded. Make sure the remote service is running, then try again — only this window is affected.',
    details: 'Technical details',
    tryAgain: 'Try Again',
    closeWindow: 'Close Window',
    catalogFailed: 'Failed to load remote app catalog — local apps only',
  },
  loading: {
    generic: 'Loading...',
  },
  toast: {
    dismiss: 'Dismiss notification',
  },
  resume: {
    filename: 'Resume.pdf',
    openNewTab: 'Open in new tab',
    download: 'Download',
  },
  inspector: {
    title: 'Federation Inspector',
    subtitle: 'Runtime Module Federation state · failure-recovery demo',
    reactSingleton: 'React singleton',
    singletonCaption: 'Negotiated once, shared by every remote',
    registryStatus: 'Registry status',
    statusLoading: 'loading',
    statusReady: 'ready',
    statusDegraded: 'degraded',
    noRemotes: 'No remotes registered',
    colApp: 'Remote app',
    colLoads: 'Loads',
    dev: 'DEV',
    prod: 'PROD',
    stRegistered: 'registered',
    stLoading: 'loading',
    stLoaded: 'loaded',
    stError: 'error',
    stChaos: 'chaos',
    break: 'Break',
    breakTitle: 'Re-register this remote with a bad URL and reopen its window to demo the failure → recovery flow',
    healAll: 'Heal all',
    healAllTitle: 'Re-register every remote with its healthy entry',
    openApp: 'Open app',
    chaosToast: "Poisoned the '{{name}}' container — recover it with Try Again in the open window",
    healToast: 'Restored every remote to its healthy entry',
    notLoaded: '—',
    explainer:
      'Each remote is registered at runtime from a URL injected by the manifest. Breaking one reproduces the post-redeploy stale-chunk case; only the failed window is isolated and recovers.',
  },
  tokens: {
    title: 'Design Tokens',
    subtitle: '3-layer token pipeline · raw colors blocked by lint',
    guardTitle: 'Token guardrail',
    guardBody:
      'Raw colors (hex/rgb/hsl) and arbitrary px sizes are blocked by eslint rules (local/no-raw-colors, local/no-raw-px). Every color and size comes from one token source (@proto/shared/theme), with sizes in rem.',
    typeScale: 'Type scale',
    typeScaleDesc: 'rem-based font-size tokens',
    layerPrimitive: 'Primitive',
    layerPrimitiveDesc: 'Raw palette values',
    layerSemantic: 'Semantic',
    layerSemanticDesc: 'Role-based aliases',
    layerComponent: 'Component',
    layerComponentDesc: 'Tokens consumed by components',
  },
  about: {
    subtitle: 'Module Federation web desktop · a resume you can run',
    honesty:
      'A clean-room reproduction of the projects on my résumé, rebuilt from their architecture and specs with AI-assisted coding.',
    claimsTitle: 'Claims → Evidence',
    claimsCaption: 'Each résumé point mapped to a demo that actually runs. Click a row to open it.',
    tagLive: 'live',
    tagPartial: 'partial',
    tagPlanned: 'planned',
    claim: {
      federation: {
        title: 'Runtime remote-URL injection + independent deploys',
        desc: 'The host declares no remotes at build time. It fetches a manifest at boot and registers each remote at runtime via registerRemotes(). Remotes span two tiers — minimal-contract references (Calculator · Notes) and domain dashboards (Neutron · Nova).',
      },
      recovery: {
        title: 'Post-redeploy stale-chunk recovery — only the failed frame',
        desc: "Inspector's 'Break' reproduces a chunk broken by a redeploy. The failure is isolated to that window's ErrorBoundary; 'Try Again' resets the container cache and recovers just that frame.",
      },
      singleton: {
        title: 'React 19 singleton sharing',
        desc: 'React/ReactDOM are negotiated once and shared by every remote. The Inspector shows the single negotiated version.',
      },
      windowing: {
        title: 'Windowing — move · resize · snap · restore',
        desc: 'A react-rnd window layer owned by the shell: Aero snap, a genie minimize animation, and layout persistence to localStorage. Try dragging this window to a screen edge.',
      },
      openstack: {
        title: 'OpenStack dashboards — Neutron · Nova remotes',
        desc: 'The Network (Neutron) and Compute (Nova) dashboards run as independently deployed remotes, on TanStack Query caching and an MSW-mocked REST layer — outage-injection demo included.',
      },
      testing: {
        title: 'Test infrastructure — Vitest/MSW + Playwright E2E + CI gate',
        desc: 'Vitest+MSW unit/integration tests and Playwright E2E (window ops, remote loading, failure recovery) are enforced on every PR by a GitHub Actions gate.',
      },
      i18n: {
        title: 'i18n ko/en pipeline · missing-key guard',
        desc: 'ko is the source; en is a type-mirror of ko, so a missing key is a compile error — enforced by the build step of the CI PR gate. Try the language button in the tray.',
      },
      theming: {
        title: 'Design tokens + dark mode',
        desc: 'Theme is a class toggle on the shell root; tokens come from a shared package. Switch it with the theme button. Custom lint rules block raw color/px literals, so every color and size comes from the token source alone.',
      },
      aidx: {
        title: 'AI-collaboration DX — AGENTS.md conventions + hard guardrails',
        desc: 'Team conventions live in a single AGENTS.md; raw-color/px lint rules and the i18n type mirror force AI-written code to follow them too. Remote scaffolding is automated by a validated Skill.',
      },
      perf: {
        title: 'Rendering performance — virtual scroll (10,000 rows) · debounced search',
        desc: "A claim from my previous role (Tmax). It sits outside this desktop's thesis (MF architecture · engineering workflow), so it is not reproduced here yet.",
      },
    },
    act: {
      inspector: 'Show in Inspector',
      theme: 'Toggle theme',
      locale: 'Toggle language',
      open: 'Open the app',
      source: 'View source',
      ci: 'View CI runs',
      agents: 'View AGENTS.md',
    },
    decisionsTitle: 'Technical decisions · trade-offs',
    decision: {
      runtime: {
        title: 'Runtime, not build-time, registration',
        desc: 'Adding or moving a remote is just a manifest edit — no host rebuild. Each user gets a personalized app set, and apps can be added or removed freely.',
      },
      singleton: {
        title: 'Shared-module config: performance + a matched React singleton',
        desc: 'Host and remotes share requiredVersion ^19 to prevent two Reacts from loading. Dependencies common to several apps are served by the host as one shared bundle, which optimizes performance.',
      },
      compiler: {
        title: 'React Compiler migration — why watch() went stale',
        desc: "While removing manual memoization I found react-hook-form's watch() — a mutable render-time reference — clashing with compiler caching, freezing the screen; switching to subscription-based useWatch fixed it. The same family of decision recurs in this repo: the retry wrapper lives in useState, not useMemo (WindowFrame).",
      },
    },
    linksTitle: 'Deployments · source',
    linksCaption: 'Actually deployed — this desktop loads them at runtime.',
    link: {
      host: 'Host (web desktop)',
      remote: 'Remote · {{name}}',
      repo: 'Source repository',
    },
    shortcutsTitle: 'Keyboard shortcuts',
    shortcut: {
      about: 'Open About',
      inspector: 'Open Inspector',
      theme: 'Toggle theme',
      locale: 'Toggle language',
      tour: 'Guide tour',
    },
    stackTitle: 'Tech stack',
    replayTour: 'Replay guide tour',
  },
  tour: {
    next: 'Next',
    back: 'Back',
    skip: 'Skip',
    done: 'Get started',
    progress: '{{current}} / {{total}}',
    step: {
      welcome: {
        title: 'Welcome to KBH-Desktop',
        body: 'A web desktop built with Module Federation — a clean-room reproduction of a real in-house project. Everything here actually runs. Take a 30-second tour.',
      },
      calculator: {
        title: 'Launch a remote app',
        body: "Calculator loads at runtime from the separately-deployed remote-calculator. After the tour, try this icon — you'll see the load time as a toast and an MFE badge in the title bar.",
      },
      inspector: {
        title: 'Look inside the runtime',
        body: "The Federation Inspector shows each remote's injected URL and load time, and lets you demo the failure → recovery flow with one click.",
      },
      tray: {
        title: 'Language · theme',
        body: 'This tray switches Korean/English and dark/light themes. After the tour, try toggling them yourself.',
      },
      done: {
        title: "You're all set",
        body: 'Press "Get started" to open the About app — see each résumé claim mapped to a live demo. Replay this tour anytime with Alt + /.',
      },
    },
  },
};
