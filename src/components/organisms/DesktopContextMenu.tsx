import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import {
  Info,
  Activity,
  Sun,
  Moon,
  Languages,
  PlayCircle,
  RefreshCw,
  type LucideIcon,
} from 'lucide-react';
import { useWindowStore } from '../../store/windowStore';
import { usePrefsStore } from '../../store/prefsStore';
import { useTourStore } from '../../store/tourStore';
import { useAppRegistry } from '../../registry/appRegistry';
import { useToastStore } from '../../store/toastStore';
import { forceRefreshRemote } from '../../federation/runtime';
import { useTranslation } from '../../i18n';
import { useMenuFocus } from '../../hooks/useMenuFocus';

interface DesktopContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
}

const MENU_WIDTH = 224;
const MENU_MAX_HEIGHT = 320;

/**
 * Right-click desktop menu. Portaled to `document.body` so it escapes the
 * Desktop's `z-index:0` stacking context (otherwise windows would paint over
 * it), and self-scopes the `dark` class for theme-aware `glass-chrome`.
 */
export function DesktopContextMenu({ x, y, onClose }: DesktopContextMenuProps) {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);

  const openWindow = useWindowStore((s) => s.openWindow);
  const toggleTheme = usePrefsStore((s) => s.toggleTheme);
  const toggleLocale = usePrefsStore((s) => s.toggleLocale);
  const theme = usePrefsStore((s) => s.theme);
  const startTour = useTourStore((s) => s.start);
  const addToast = useToastStore((s) => s.addToast);

  // Clamp to the viewport so the menu never opens off-screen.
  const [pos] = useState(() => ({
    left: Math.min(x, Math.max(8, window.innerWidth - MENU_WIDTH - 8)),
    top: Math.min(y, Math.max(8, window.innerHeight - MENU_MAX_HEIGHT - 8)),
  }));

  // Dismiss on outside pointer, scroll, or resize. Escape (plus roving
  // focus and focus restore) is handled by useMenuFocus.
  useEffect(() => {
    const onPointerDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    window.addEventListener('mousedown', onPointerDown);
    window.addEventListener('resize', onClose);
    window.addEventListener('scroll', onClose, true);
    return () => {
      window.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('resize', onClose);
      window.removeEventListener('scroll', onClose, true);
    };
  }, [onClose]);

  useMenuFocus(ref, onClose);

  const run = (fn: () => void) => () => {
    fn();
    onClose();
  };

  const refreshRemotes = () => {
    const entries = useAppRegistry.getState().entries;
    for (const entry of Object.values(entries)) {
      if (entry.remote) forceRefreshRemote({ name: entry.remote.name, entry: entry.remote.entry });
    }
    addToast({ type: 'success', message: t('desktop.remotesRefreshed'), duration: 3000 });
  };

  return createPortal(
    <div className={theme === 'dark' ? 'dark' : ''}>
      <div
        ref={ref}
        role="menu"
        aria-label={t('desktop.menuLabel')}
        className="fixed z-[10000] w-56 glass-chrome rounded-xl border border-white/50 dark:border-white/10 shadow-2xl p-1.5"
        style={{ left: pos.left, top: pos.top }}
        onContextMenu={(e) => e.preventDefault()}
      >
        <MenuItem icon={Info} label={t('desktop.openAbout')} onClick={run(() => openWindow('about', 'About'))} />
        <MenuItem
          icon={Activity}
          label={t('desktop.openInspector')}
          onClick={run(() => openWindow('inspector', 'Inspector'))}
        />
        <Divider />
        <MenuItem
          icon={theme === 'dark' ? Sun : Moon}
          label={t('desktop.toggleTheme')}
          onClick={run(toggleTheme)}
        />
        <MenuItem icon={Languages} label={t('desktop.toggleLocale')} onClick={run(toggleLocale)} />
        <Divider />
        <MenuItem icon={PlayCircle} label={t('desktop.replayTour')} onClick={run(startTour)} />
        <MenuItem icon={RefreshCw} label={t('desktop.refreshRemotes')} onClick={run(refreshRemotes)} />
      </div>
    </div>,
    document.body,
  );
}

function MenuItem({ icon: Icon, label, onClick }: { icon: LucideIcon; label: string; onClick: () => void }) {
  return (
    <button
      role="menuitem"
      tabIndex={-1}
      onClick={onClick}
      className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-sm text-gray-700 dark:text-gray-200 hover:bg-black/5 dark:hover:bg-white/10 focus:bg-black/5 dark:focus:bg-white/10 focus:outline-none transition-colors text-left"
    >
      <Icon className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
      <span className="flex-1">{label}</span>
    </button>
  );
}

function Divider(): ReactNode {
  return <div className="my-1 h-px bg-black/10 dark:bg-white/10" />;
}
