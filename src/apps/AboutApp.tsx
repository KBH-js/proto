import {
  Terminal,
  Boxes,
  ShieldCheck,
  Package,
  Languages,
  Palette,
  Activity,
  Github,
  Linkedin,
  Mail,
  Sun,
  Moon,
  ArrowUpRight,
  Server,
  PlayCircle,
  AppWindow,
  Cloud,
  FlaskConical,
  Bot,
  Gauge,
  type LucideIcon,
} from 'lucide-react';
import { LiquidGlass } from '@proto/shared/glass';
import { useWindowStore } from '../store/windowStore';
import { usePrefsStore } from '../store/prefsStore';
import { useTourStore } from '../store/tourStore';
import { useAppRegistry } from '../registry/appRegistry';
import { useCopyEmail } from '../hooks/useCopyEmail';
import { useTranslation, translateAppTitle, type TFunction } from '../i18n';
import { portfolioConfig } from '../config/portfolio.config';
import { Tooltip } from '../components/atoms/Tooltip';

/**
 * About — the portfolio's thesis, in engineer tone.
 *
 * Its centrepiece is a "Claims → Evidence" table: every résumé point is a row
 * that either opens the running feature that proves it (Inspector, theme /
 * language toggles) or deep-links the source, and unproven points are tagged
 * "planned" rather than dressed up as done. Fully theme-aware and i18n-driven
 * (consumes Tier 1's prefs/i18n contract).
 */

type Tag = 'live' | 'partial' | 'planned';

type ClaimAction =
  | { kind: 'inspector' }
  | { kind: 'theme' }
  | { kind: 'locale' }
  | { kind: 'open'; app: string; title: string }
  | { kind: 'link'; href: string; labelKey: string };

interface ClaimRow {
  /** i18n key under about.claim.<key> */
  key: string;
  icon: LucideIcon;
  tag: Tag;
  /** Omitted on rows with nothing runnable to show (e.g. planned work) */
  action?: ClaimAction;
}

const CLAIMS: ClaimRow[] = [
  { key: 'federation', icon: Boxes, tag: 'live', action: { kind: 'inspector' } },
  { key: 'recovery', icon: ShieldCheck, tag: 'live', action: { kind: 'inspector' } },
  { key: 'singleton', icon: Package, tag: 'live', action: { kind: 'inspector' } },
  {
    key: 'windowing',
    icon: AppWindow,
    tag: 'live',
    action: {
      kind: 'link',
      href: `${portfolioConfig.repo}/blob/main/src/store/windowStore.ts`,
      labelKey: 'about.act.source',
    },
  },
  {
    key: 'openstack',
    icon: Cloud,
    tag: 'live',
    action: { kind: 'open', app: 'network', title: 'Network' },
  },
  {
    key: 'testing',
    icon: FlaskConical,
    tag: 'live',
    action: { kind: 'link', href: `${portfolioConfig.repo}/actions`, labelKey: 'about.act.ci' },
  },
  { key: 'i18n', icon: Languages, tag: 'live', action: { kind: 'locale' } },
  { key: 'theming', icon: Palette, tag: 'live', action: { kind: 'theme' } },
  {
    key: 'aidx',
    icon: Bot,
    tag: 'live',
    action: {
      kind: 'link',
      href: `${portfolioConfig.repo}/blob/main/AGENTS.md`,
      labelKey: 'about.act.agents',
    },
  },
  { key: 'perf', icon: Gauge, tag: 'planned' },
];

const DECISIONS = ['runtime', 'singleton', 'compiler'] as const;

const SHORTCUTS: { keys: string; key: string }[] = [
  { keys: 'Alt + A', key: 'about' },
  { keys: 'Alt + I', key: 'inspector' },
  { keys: 'Alt + T', key: 'theme' },
  { keys: 'Alt + L', key: 'locale' },
  { keys: 'Alt + /', key: 'tour' },
];

const STACK = [
  'React 19',
  'TypeScript',
  'Module Federation',
  'Rsbuild (Rspack)',
  'TanStack Query',
  'Zustand',
  'Tailwind',
  'Vitest',
  'MSW',
  'Playwright',
  'GitHub Actions',
];

// Only text/dot colour survives — the pill body is now a Liquid Glass surface.
const TAG_TEXT: Record<Tag, string> = {
  live: 'text-green-700 dark:text-green-300',
  partial: 'text-amber-700 dark:text-amber-300',
  planned: 'text-gray-500 dark:text-gray-300',
};

function TagBadge({ tag, t }: { tag: Tag; t: TFunction }) {
  const label = tag === 'live' ? t('about.tagLive') : tag === 'partial' ? t('about.tagPartial') : t('about.tagPlanned');
  return (
    <LiquidGlass
      variant="button"
      inline
      as="span"
      className={`lg-text items-center gap-1 px-1.5 py-0.5 text-3xs font-bold uppercase tracking-wider ${TAG_TEXT[tag]}`}
    >
      {tag === 'live' && <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />}
      {label}
    </LiquidGlass>
  );
}

function ClaimActionButton({ action, t }: { action: ClaimAction; t: TFunction }) {
  const openWindow = useWindowStore((s) => s.openWindow);
  const toggleTheme = usePrefsStore((s) => s.toggleTheme);
  const toggleLocale = usePrefsStore((s) => s.toggleLocale);

  // Glass pills: semantic colour survives on the text/icon; the pill body is a
  // Liquid Glass surface (hover brightens via the built-in sheen).
  const base =
    'lg-text inline-flex items-center gap-1 px-2 py-1 text-2xs font-medium hover:brightness-110 transition-[filter]';

  switch (action.kind) {
    case 'inspector':
      return (
        <LiquidGlass
          variant="button"
          as="button"
          onClick={() => openWindow('inspector', 'Inspector')}
          className={`${base} text-indigo-700 dark:text-indigo-300`}
        >
          <Activity className="w-3 h-3" />
          {t('about.act.inspector')}
        </LiquidGlass>
      );
    case 'theme':
      return (
        <LiquidGlass
          variant="button"
          as="button"
          onClick={toggleTheme}
          className={`${base} text-gray-700 dark:text-gray-100`}
        >
          <Sun className="w-3 h-3 dark:hidden" />
          <Moon className="w-3 h-3 hidden dark:inline" />
          {t('about.act.theme')}
        </LiquidGlass>
      );
    case 'locale':
      return (
        <LiquidGlass
          variant="button"
          as="button"
          onClick={toggleLocale}
          className={`${base} text-sky-700 dark:text-sky-300`}
        >
          <Languages className="w-3 h-3" />
          {t('about.act.locale')}
        </LiquidGlass>
      );
    case 'open':
      return (
        <LiquidGlass
          variant="button"
          as="button"
          onClick={() => openWindow(action.app, action.title)}
          className={`${base} text-emerald-700 dark:text-emerald-300`}
        >
          <PlayCircle className="w-3 h-3" />
          {t('about.act.open')}
        </LiquidGlass>
      );
    case 'link':
      return (
        <LiquidGlass
          variant="button"
          as="a"
          href={action.href}
          target="_blank"
          rel="noopener noreferrer"
          className={`${base} text-gray-700 dark:text-gray-200`}
        >
          <ArrowUpRight className="w-3 h-3" />
          {t(action.labelKey)}
        </LiquidGlass>
      );
  }
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
      {children}
    </h2>
  );
}

export function AboutApp() {
  const { t } = useTranslation();
  const startTour = useTourStore((s) => s.start);
  const copyEmail = useCopyEmail();
  const registryEntries = useAppRegistry((s) => s.entries);

  // Remote deployments come from the registry (fed by remotes.manifest.json),
  // so adding a remote never leaves this list stale. `prodEntry` is the
  // manifest's production URL — `entry` resolves to localhost under dev.
  const remoteLinks = Object.values(registryEntries)
    .filter((entry) => entry.isRemote && entry.remote)
    .map((entry) => {
      const { prodEntry } = entry.remote!;
      let href = prodEntry;
      try {
        href = new URL(prodEntry).origin;
      } catch {
        // keep the raw manifest value if it isn't a valid absolute URL
      }
      const name = translateAppTitle(t, entry.defaultConfig.componentType, entry.defaultConfig.title);
      return { label: t('about.link.remote', { name }), href, icon: Boxes };
    });

  const deployLinks: { label: string; href: string; icon: LucideIcon }[] = [
    { label: t('about.link.host'), href: portfolioConfig.deployments.host, icon: Server },
    ...remoteLinks,
    { label: t('about.link.repo'), href: portfolioConfig.repo, icon: Github },
  ];

  const contactLinks = [
    { label: 'GitHub', href: portfolioConfig.links.github, icon: Github },
    { label: 'LinkedIn', href: portfolioConfig.links.linkedin, icon: Linkedin },
  ];

  return (
    <div className="flex flex-col h-full bg-white/60 dark:bg-neutral-900/50 text-gray-800 dark:text-gray-100 overflow-auto">
      {/* Header */}
      <div className="p-5 bg-gradient-to-r from-sky-600 to-blue-700 text-white">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center flex-shrink-0">
            <Terminal className="w-7 h-7" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold leading-tight">{portfolioConfig.owner.name}</h1>
            <p className="text-sm text-white/90">{portfolioConfig.owner.title}</p>
            <p className="text-xs text-white/70 mt-1">{t('about.subtitle')}</p>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* Contact — the funnel's endpoint lives right where the tour lands */}
            {contactLinks.map(({ label, href, icon: Icon }) => (
              <Tooltip key={label} label={label}>
                <LiquidGlass
                  variant="button"
                  as="a"
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  radius={10}
                  className="lg-text flex items-center p-1.5 text-white hover:brightness-110 transition-[filter]"
                  aria-label={label}
                >
                  <Icon className="w-4 h-4" />
                </LiquidGlass>
              </Tooltip>
            ))}
            <Tooltip label={t('taskbar.copyEmail')}>
              <LiquidGlass
                variant="button"
                as="button"
                onClick={() => copyEmail(portfolioConfig.owner.email)}
                radius={10}
                className="lg-text flex items-center p-1.5 text-white hover:brightness-110 transition-[filter]"
                aria-label={t('taskbar.copyEmail')}
              >
                <Mail className="w-4 h-4" />
              </LiquidGlass>
            </Tooltip>
            <Tooltip label={t('about.replayTour')}>
              <LiquidGlass
                variant="button"
                as="button"
                onClick={startTour}
                radius={10}
                className="lg-text flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-white hover:brightness-110 transition-[filter]"
                aria-label={t('about.replayTour')}
              >
                <PlayCircle className="w-4 h-4" />
                <span className="hidden @lg:inline">{t('about.replayTour')}</span>
              </LiquidGlass>
            </Tooltip>
          </div>
        </div>
      </div>

      <div className="flex-1 p-5 space-y-6">
        {/* Honesty banner */}
        <div className="flex gap-2.5 p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
          <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed">{t('about.honesty')}</p>
        </div>

        {/* Claims → Evidence */}
        <section>
          <SectionTitle>{t('about.claimsTitle')}</SectionTitle>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 -mt-1">{t('about.claimsCaption')}</p>
          <ul className="space-y-2">
            {CLAIMS.map((row) => {
              const Icon = row.icon;
              return (
                <LiquidGlass
                  variant="card"
                  as="li"
                  key={row.key}
                  radius={12}
                  className="p-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/70 dark:bg-white/10 border border-white/40 dark:border-white/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-gray-500 dark:text-gray-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-medium text-sm text-gray-800 dark:text-gray-100">
                          {t(`about.claim.${row.key}.title`)}
                        </h3>
                        <TagBadge tag={row.tag} t={t} />
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
                        {t(`about.claim.${row.key}.desc`)}
                      </p>
                      {row.action && (
                        <div className="mt-2">
                          <ClaimActionButton action={row.action} t={t} />
                        </div>
                      )}
                    </div>
                  </div>
                </LiquidGlass>
              );
            })}
          </ul>
        </section>

        {/* Technical decisions */}
        <section>
          <SectionTitle>{t('about.decisionsTitle')}</SectionTitle>
          <div className="grid @lg:grid-cols-2 gap-2">
            {DECISIONS.map((key) => (
              <LiquidGlass variant="card" key={key} radius={12} className="p-3">
                <h3 className="text-xs font-semibold text-gray-800 dark:text-gray-100">
                  {t(`about.decision.${key}.title`)}
                </h3>
                <p className="text-2xs text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
                  {t(`about.decision.${key}.desc`)}
                </p>
              </LiquidGlass>
            ))}
          </div>
        </section>

        {/* Deployments · source */}
        <section>
          <SectionTitle>{t('about.linksTitle')}</SectionTitle>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 -mt-1">{t('about.linksCaption')}</p>
          <div className="grid @lg:grid-cols-2 gap-2">
            {deployLinks.map((link) => {
              const Icon = link.icon;
              return (
                <LiquidGlass
                  variant="card"
                  as="a"
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  radius={12}
                  className="flex items-center gap-2 px-3 py-2 hover:brightness-110 transition-[filter] group"
                >
                  <Icon className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-800 dark:text-gray-100">{link.label}</p>
                    <p className="text-3xs text-gray-500 dark:text-gray-400 font-mono truncate">
                      {link.href.replace(/^https?:\/\//, '')}
                    </p>
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200 flex-shrink-0" />
                </LiquidGlass>
              );
            })}
          </div>
        </section>

        {/* Keyboard shortcuts */}
        <section>
          <SectionTitle>{t('about.shortcutsTitle')}</SectionTitle>
          <div className="grid @lg:grid-cols-2 gap-x-4 gap-y-1.5">
            {SHORTCUTS.map((s) => (
              <div key={s.key} className="flex items-center justify-between gap-2">
                <span className="text-xs text-gray-600 dark:text-gray-300">{t(`about.shortcut.${s.key}`)}</span>
                <kbd className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-white/10 border border-gray-200 dark:border-white/10 text-3xs font-mono text-gray-600 dark:text-gray-300 whitespace-nowrap">
                  {s.keys}
                </kbd>
              </div>
            ))}
          </div>
        </section>

        {/* Tech stack */}
        <section>
          <SectionTitle>{t('about.stackTitle')}</SectionTitle>
          <div className="flex flex-wrap gap-1.5">
            {STACK.map((name) => (
              <span
                key={name}
                className="px-2 py-0.5 rounded-full text-3xs font-medium bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300"
              >
                {name}
              </span>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
