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
    tokens: 'Design Tokens',
  },
  taskbar: {
    startMenu: 'Start Menu',
    apps: 'Apps',
    connect: 'Connect',
    noWindows: 'No open windows',
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
    loadingRemotes: 'Loading Remote Modules via Module Federation...',
    startingWm: 'Starting window manager...',
    ready: 'System ready.',
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
    colEntry: 'Entry URL',
    colStatus: 'Status',
    colLoadTime: 'Load time',
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
      'Raw colors (hex/rgb/hsl) are blocked by the eslint rule (local/no-raw-colors). Every color comes from one token source (@proto/shared/theme).',
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
      "A clean-room reproduction of an in-house project. The source can't leave the corporate network, so only the architecture and workflow are rebuilt — everything tagged “live” below actually runs in this screen.",
    claimsTitle: 'Claims → Evidence',
    claimsCaption: 'Each résumé point mapped to a demo that actually runs. Click a row to open it.',
    tagLive: 'live',
    tagPartial: 'partial',
    tagPlanned: 'planned',
    claim: {
      federation: {
        title: 'Runtime remote-URL injection + independent deploys',
        desc: "The host declares no remotes at build time. It fetches a manifest at boot and registers each remote at runtime via registerRemotes(). The résumé's 13 apps are represented here by 2 (Calculator, Notes), each deployed independently.",
      },
      recovery: {
        title: 'Post-redeploy stale-chunk recovery — only the failed frame',
        desc: "Inspector's 'Break' reproduces a chunk broken by a redeploy. The failure is isolated to that window's ErrorBoundary; 'Try Again' resets the container cache and recovers just that frame.",
      },
      singleton: {
        title: 'React 19 singleton sharing',
        desc: 'React/ReactDOM are negotiated once and shared by every remote. The Inspector shows the single negotiated version.',
      },
      i18n: {
        title: 'i18n ko/en pipeline · missing-key guard',
        desc: 'ko is the source; en is a type-mirror of ko, so a missing key is a compile error — this repo’s analog of the CI missing-key check. Try the language button in the tray.',
      },
      theming: {
        title: 'Design tokens + dark mode',
        desc: 'Theme is a class toggle on the shell root; tokens come from a shared package. Switch it with the theme button. (A Storybook light/dark VRT matrix is planned.)',
      },
      testing: {
        title: 'Vitest / MSW integration tests',
        desc: 'Unit + integration tests for the catalog, window store, and geometry run via pnpm test. (~160 Playwright E2E specs are planned.)',
      },
      compiler: {
        title: 'React Compiler migration',
        desc: "The host runs React Compiler. That's why the remote-retry wrapper lives in useState, not useMemo — the compiler skips the recompute, so a cached rejection would be reused.",
      },
      domain: {
        title: 'Virtual scroll · debounced search · client caching',
        desc: 'Large-list optimizations from prior work. Planned for a Tier 2 domain remote — not in this demo yet.',
      },
      aidx: {
        title: 'AI dev-workflow conventions',
        desc: "The repo's CLAUDE.md conventions and lint gate constrain agent work. Hook-based CI blocking and a verification skill are partially reproduced.",
      },
    },
    act: {
      inspector: 'Show in Inspector',
      source: 'View source',
      theme: 'Toggle theme',
      locale: 'Toggle language',
      test: 'Test source',
    },
    decisionsTitle: 'Technical decisions · trade-offs',
    decision: {
      runtime: {
        title: 'Runtime, not build-time, registration',
        desc: 'Adding or moving a remote is just a manifest edit — no host rebuild. The trade-off is giving up type-safe static imports.',
      },
      recovery: {
        title: 'Per-window isolation + a fresh lazy wrapper',
        desc: 'React.lazy permanently caches a rejected promise, so retry must build a fresh wrapper — kept in useState so it survives React Compiler memoization.',
      },
      css: {
        title: 'Exposed modules import their own CSS',
        desc: "That's how styles reach the host. Global body/html rules stay in the standalone entry only, so they never pollute the host document.",
      },
      singleton: {
        title: 'Matched React singleton version',
        desc: 'Host and remotes share requiredVersion ^19 to prevent two Reacts from loading.',
      },
    },
    linksTitle: 'Deployments · source',
    linksCaption: 'Actually deployed — this desktop loads them at runtime.',
    link: {
      host: 'Host (web desktop)',
      calculator: 'Remote · Calculator',
      notes: 'Remote · Notes',
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
        body: "Click Calculator to load it from the separately-deployed remote-calculator. You'll see the load time as a toast and an MFE badge in the title bar.",
      },
      inspector: {
        title: 'Look inside the runtime',
        body: "The Federation Inspector shows each remote's injected URL and load time, and lets you demo the failure → recovery flow with one click.",
      },
      tray: {
        title: 'Language · theme · status',
        body: 'Switch Korean/English and dark/light here, and see how many remotes are currently connected.',
      },
      done: {
        title: "You're all set",
        body: 'Open the About app to see each résumé claim mapped to a live demo. You can replay this tour anytime.',
      },
    },
  },
};
