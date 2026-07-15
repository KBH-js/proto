import { useState, useRef, useEffect, useMemo, version as reactVersion } from 'react';
import { LiquidGlass } from '@proto/shared/glass';
import { useWindowStore } from '../../store/windowStore';
import { useToastStore } from '../../store/toastStore';
import { useAppRegistry } from '../../registry/appRegistry';
import { usePrefsStore } from '../../store/prefsStore';
import { useTranslation, translateAppTitle } from '../../i18n';
import { useAppLauncher } from '../../hooks/useAppLauncher';
import { getAppIcon } from '../shared/appIcons';
import { TASKBAR_HEIGHT, TASKBAR_Z_INDEX } from '../../types/window.types';
import { TaskbarItem } from '../molecules/TaskbarItem';
import { portfolioConfig } from '../../config/portfolio.config';
import {
  Terminal,
  Github,
  Linkedin,
  Mail,
  ExternalLink,
  User,
  Copy,
  Package,
  Sun,
  Moon,
  Languages,
  Zap,
} from 'lucide-react';

interface StartMenuLink {
  icon: React.ReactNode;
  label: string;
  href: string;
  description?: string;
  /** If true, show copy button instead of external link */
  copyable?: boolean;
}

export function Taskbar() {
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);
  const startMenuRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  const windows = useWindowStore((state) => state.windows);
  const activeWindowId = useWindowStore((state) => state.activeWindowId);
  const minimizeWindow = useWindowStore((state) => state.minimizeWindow);
  const restoreWindow = useWindowStore((state) => state.restoreWindow);
  const focusWindow = useWindowStore((state) => state.focusWindow);
  const openWindow = useWindowStore((state) => state.openWindow);

  const theme = usePrefsStore((state) => state.theme);
  const locale = usePrefsStore((state) => state.locale);
  const toggleTheme = usePrefsStore((state) => state.toggleTheme);
  const toggleLocale = usePrefsStore((state) => state.toggleLocale);

  const entries = useAppRegistry((state) => state.entries);
  const availableApps = useMemo(
    () => Object.values(entries).map((entry) => entry.defaultConfig),
    [entries],
  );
  const remoteCount = useMemo(
    () => Object.values(entries).filter((entry) => entry.isRemote).length,
    [entries],
  );
  const launchApp = useAppLauncher();

  const addToast = useToastStore((state) => state.addToast);

  const externalLinks: StartMenuLink[] = [
    {
      icon: <Github className="w-5 h-5" />,
      label: 'GitHub',
      href: portfolioConfig.links.github,
      description: t('taskbar.githubDesc'),
    },
    {
      icon: <Linkedin className="w-5 h-5" />,
      label: 'LinkedIn',
      href: portfolioConfig.links.linkedin,
      description: t('taskbar.linkedinDesc'),
    },
    {
      icon: <Mail className="w-5 h-5" />,
      label: t('taskbar.email'),
      href: portfolioConfig.owner.email,
      description: t('taskbar.emailDesc'),
      copyable: true,
    },
  ];

  const handleCopyEmail = async (email: string) => {
    try {
      await navigator.clipboard.writeText(email);
      addToast({
        message: t('taskbar.emailCopied'),
        type: 'success',
        duration: 3000,
      });
      setIsStartMenuOpen(false);
    } catch {
      addToast({
        message: t('taskbar.copyFailed'),
        type: 'error',
        duration: 3000,
      });
    }
  };

  // Close start menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (startMenuRef.current && !startMenuRef.current.contains(event.target as Node)) {
        setIsStartMenuOpen(false);
      }
    };

    if (isStartMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isStartMenuOpen]);

  const handleTaskbarItemClick = (windowId: string, isMinimized: boolean, isActive: boolean) => {
    if (isMinimized) {
      restoreWindow(windowId);
      focusWindow(windowId);
    } else if (isActive) {
      // Only minimize when clicking the already-active window
      minimizeWindow(windowId);
    } else {
      focusWindow(windowId);
    }
  };

  return (
    <div
      className="fixed bottom-0 left-0 right-0 flex items-end justify-center pointer-events-none"
      style={{
        height: TASKBAR_HEIGHT,
        zIndex: TASKBAR_Z_INDEX,
      }}
    >
      {/* Floating Liquid Glass Dock — detached from the screen edges */}
      <LiquidGlass
        variant="dock"
        className="pointer-events-auto flex items-center gap-1 mb-2 mx-3 h-12 px-2"
      >
      {/* Start Button */}
      <div className="relative" ref={startMenuRef}>
        <button
          onClick={() => setIsStartMenuOpen(!isStartMenuOpen)}
          className={`
            relative flex items-center justify-center w-10 h-10 rounded-xl
            transition-all duration-200
            ${isStartMenuOpen
              ? 'aqua-gel text-white'
              : 'hover:bg-black/5 dark:hover:bg-white/10 text-gray-700 dark:text-gray-200'
            }
          `}
          title={t('taskbar.startMenu')}
        >
          <Terminal className="relative z-10 w-5 h-5" />
        </button>

        {/* Start Menu Dropdown */}
        {isStartMenuOpen && (
          <LiquidGlass
            variant="menu"
            className="absolute bottom-full left-0 mb-3 w-72 overflow-hidden"
            style={{ zIndex: TASKBAR_Z_INDEX + 1 }}
          >
            {/* Header */}
            <div className="px-4 py-3 bg-white/30 dark:bg-white/5 border-b border-black/5 dark:border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-500 to-accent flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-gray-800 dark:text-gray-100 font-semibold">KBH-Desktop</h3>
                </div>
              </div>
            </div>

            {/* Apps */}
            <div className="p-2 border-b border-black/5 dark:border-white/10">
              <p className="px-2 py-1 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('taskbar.apps')}
              </p>
              {availableApps.map((app) => {
                const AppIcon = getAppIcon(app.icon) ?? Package;
                return (
                  <button
                    key={app.componentType}
                    onClick={() => {
                      launchApp(app);
                      setIsStartMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors group"
                  >
                    <AppIcon className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-100 transition-colors" />
                    <span className="flex-1 text-left text-sm text-gray-800 dark:text-gray-100">
                      {translateAppTitle(t, app.componentType, app.title)}
                    </span>
                    {app.externalUrl && (
                      <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* External Links */}
            <div className="p-2">
              <p className="px-2 py-1 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('taskbar.connect')}
              </p>
              {externalLinks.map((link) => {
                if (link.copyable) {
                  return (
                    <div
                      key={link.label}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors group"
                    >
                      <span className="text-gray-500 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-100 transition-colors">
                        {link.icon}
                      </span>
                      <div className="flex-1">
                        <span className="text-sm text-gray-800 dark:text-gray-100">{link.label}</span>
                        {link.description && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">{link.href}</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleCopyEmail(link.href)}
                        className="p-1.5 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                        title={t('taskbar.copyEmail')}
                      >
                        <Copy className="w-4 h-4 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-100" />
                      </button>
                    </div>
                  );
                }

                return (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors group"
                    onClick={() => setIsStartMenuOpen(false)}
                  >
                    <span className="text-gray-500 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-100 transition-colors">
                      {link.icon}
                    </span>
                    <div className="flex-1">
                      <span className="text-sm text-gray-800 dark:text-gray-100">{link.label}</span>
                      {link.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">{link.description}</p>
                      )}
                    </div>
                    <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200" />
                  </a>
                );
              })}
            </div>
          </LiquidGlass>
        )}
      </div>

      {/* Separator */}
      <div className="relative w-px h-6 bg-black/10 dark:bg-white/10 mx-2" />

      {/* Taskbar items container */}
      <div className="relative flex-1 flex items-center justify-center gap-1">
        {windows.map((win) => {
          const isActive = activeWindowId === win.id;
          return (
            <TaskbarItem
              key={win.id}
              window={win}
              isActive={isActive}
              onClick={() => handleTaskbarItemClick(win.id, win.isMinimized, isActive)}
            />
          );
        })}
      </div>

      {/* System tray — federation status + theme + language toggles */}
      <div className="relative flex items-center gap-1" data-tour="tray">
        {/* Module Federation status strip — click to open the Inspector */}
        <button
          onClick={() => openWindow('inspector', 'Inspector')}
          className="hidden md:flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          title={t('taskbar.openInspector')}
        >
          <Zap className="w-3.5 h-3.5 text-accent" />
          <span className="text-[11px] font-medium whitespace-nowrap">
            {t('taskbar.federationStrip', { count: remoteCount, version: reactVersion })}
          </span>
        </button>
        <div className="hidden md:block w-px h-6 bg-black/10 dark:bg-white/10 mx-0.5" />
        <button
          onClick={toggleLocale}
          className="flex items-center gap-1 h-8 px-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          title={locale === 'ko' ? t('taskbar.toEnglish') : t('taskbar.toKorean')}
        >
          <Languages className="w-4 h-4" />
          <span className="text-xs font-semibold uppercase">{locale}</span>
        </button>
        <button
          onClick={toggleTheme}
          className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          title={theme === 'dark' ? t('taskbar.toLight') : t('taskbar.toDark')}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
      </LiquidGlass>
    </div>
  );
}
