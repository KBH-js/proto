import { useState, useRef, useMemo, version as reactVersion } from 'react';
import { LiquidGlass } from '@proto/shared/glass';
import { useWindowStore } from '../../store/windowStore';
import { useAppRegistry } from '../../registry/appRegistry';
import { usePrefsStore } from '../../store/prefsStore';
import { useTranslation } from '../../i18n';
import { TASKBAR_HEIGHT, TASKBAR_Z_INDEX } from '../../types/window.types';
import { TaskbarItem } from '../molecules/TaskbarItem';
import { StartMenu } from './StartMenu';
import { Terminal, Sun, Moon, Languages, Zap } from 'lucide-react';

export function Taskbar() {
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);
  const startButtonRef = useRef<HTMLButtonElement>(null);
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
  const remoteCount = useMemo(
    () => Object.values(entries).filter((entry) => entry.isRemote).length,
    [entries],
  );

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
        className="pointer-events-auto flex items-center gap-1 mb-2 mx-3 h-12 px-2 max-w-full min-w-0"
      >
      {/* Start Button */}
      <button
        ref={startButtonRef}
        aria-haspopup="menu"
        aria-expanded={isStartMenuOpen}
        onClick={() => setIsStartMenuOpen(!isStartMenuOpen)}
        className={`
          relative flex items-center justify-center w-10 h-10 rounded-xl flex-shrink-0
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

      {isStartMenuOpen && (
        <StartMenu anchorRef={startButtonRef} onClose={() => setIsStartMenuOpen(false)} />
      )}

      {/* Separator */}
      <div className="relative w-px h-6 bg-black/10 dark:bg-white/10 mx-2 flex-shrink-0" />

      {/* Taskbar items container — centers when short, scrolls when long
          (justify-center + overflow would make the left edge unreachable) */}
      <div className="relative flex-1 min-w-0 overflow-x-auto taskbar-scroll">
        <div className="flex items-center gap-1 w-max mx-auto h-full">
          {windows.length === 0 ? (
            <span className="text-gray-600 dark:text-gray-300 text-sm whitespace-nowrap">{t('taskbar.noWindows')}</span>
          ) : (
            windows.map((win) => {
              const isActive = activeWindowId === win.id;
              return (
                <TaskbarItem
                  key={win.id}
                  window={win}
                  isActive={isActive}
                  onClick={() => handleTaskbarItemClick(win.id, win.isMinimized, isActive)}
                />
              );
            })
          )}
        </div>
      </div>

      {/* System tray — federation status + theme + language toggles */}
      <div className="relative flex items-center gap-1 flex-shrink-0" data-tour="tray">
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
