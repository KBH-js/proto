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
  PlayCircle,
  AppWindow,
  Cloud,
  FlaskConical,
  Bot,
  type LucideIcon,
} from 'lucide-react';
import { LiquidGlass } from '@proto/shared/glass';
import { useWindowStore } from '../store/windowStore';
import { usePrefsStore } from '../store/prefsStore';
import { useTourStore } from '../store/tourStore';
import { useCopyEmail } from '../hooks/useCopyEmail';
import { useTranslation, type TFunction } from '../i18n';
import { portfolioConfig } from '../config/portfolio.config';
import { Tooltip } from '../components/atoms/Tooltip';

/**
 * About — the portfolio's thesis, in engineer tone.
 *
 * Its centrepiece is a "Claims → Evidence" table: every claim is a row that
 * opens the running feature proving it (Inspector, theme / language toggles)
 * or deep-links the source. Architecture lives in the README (mermaid) and
 * the Inspector (live URLs) — this app doesn't duplicate the diagram. Fully
 * theme-aware and i18n-driven (consumes Tier 1's prefs/i18n contract).
 */

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
  /** Evidence buttons — a claim may carry several (e.g. CI runs + a live toggle) */
  actions: ClaimAction[];
}

const CLAIMS: ClaimRow[] = [
  { key: 'federation', icon: Boxes, actions: [{ kind: 'inspector' }] },
  { key: 'recovery', icon: ShieldCheck, actions: [{ kind: 'inspector' }] },
  { key: 'singleton', icon: Package, actions: [{ kind: 'inspector' }] },
  {
    key: 'windowing',
    icon: AppWindow,
    actions: [
      {
        kind: 'link',
        href: `${portfolioConfig.repo}/blob/main/src/store/windowStore.ts`,
        labelKey: 'about.act.source',
      },
    ],
  },
  {
    key: 'openstack',
    icon: Cloud,
    actions: [{ kind: 'open', app: 'network', title: 'Network' }],
  },
  {
    key: 'testing',
    icon: FlaskConical,
    actions: [
      { kind: 'link', href: `${portfolioConfig.repo}/actions`, labelKey: 'about.act.ci' },
      { kind: 'locale' },
    ],
  },
  { key: 'theming', icon: Palette, actions: [{ kind: 'theme' }] },
  {
    key: 'aidx',
    icon: Bot,
    actions: [
      {
        kind: 'link',
        href: `${portfolioConfig.repo}/blob/main/AGENTS.md`,
        labelKey: 'about.act.agents',
      },
    ],
  },
];

const DECISIONS = ['runtime', 'singleton', 'compiler'] as const;

/** Grouped for scanability — the `primary` row is the stack this desktop is about. */
const STACK_GROUPS: { key: 'core' | 'state' | 'quality'; primary?: boolean; items: string[] }[] = [
  { key: 'core', primary: true, items: ['React 19', 'TypeScript', 'Module Federation 2.x', 'Rsbuild (Rspack)'] },
  { key: 'state', items: ['Zustand', 'TanStack Query', 'Tailwind CSS', 'React Compiler'] },
  { key: 'quality', items: ['Vitest', 'MSW', 'Playwright', 'GitHub Actions'] },
];

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
                      <h3 className="font-medium text-sm text-gray-800 dark:text-gray-100">
                        {t(`about.claim.${row.key}.title`)}
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
                        {t(`about.claim.${row.key}.desc`)}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {row.actions.map((action, i) => (
                          <ClaimActionButton key={`${action.kind}-${i}`} action={action} t={t} />
                        ))}
                      </div>
                    </div>
                  </div>
                </LiquidGlass>
              );
            })}
          </ul>
        </section>

        {/* Technical decisions — one card per row for uninterrupted reading */}
        <section>
          <SectionTitle>{t('about.decisionsTitle')}</SectionTitle>
          <div className="space-y-2">
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

        {/* Tech stack */}
        <section>
          <SectionTitle>{t('about.stackTitle')}</SectionTitle>
          <div className="space-y-2">
            {STACK_GROUPS.map((group) => (
              <div key={group.key} className="flex items-baseline gap-2">
                <span className="w-16 flex-shrink-0 text-3xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                  {t(`about.stackGroup.${group.key}`)}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {group.items.map((name) => (
                    <span
                      key={name}
                      className={
                        group.primary
                          ? 'px-2 py-0.5 rounded-full text-3xs font-semibold bg-sky-100 text-sky-800 dark:bg-sky-500/20 dark:text-sky-200'
                          : 'px-2 py-0.5 rounded-full text-3xs font-medium bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300'
                      }
                    >
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
