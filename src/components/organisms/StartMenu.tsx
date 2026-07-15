import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { LiquidGlass } from '@proto/shared/glass';
import { useToastStore } from '../../store/toastStore';
import { useAppRegistry } from '../../registry/appRegistry';
import { usePrefsStore } from '../../store/prefsStore';
import { useTranslation, translateAppTitle } from '../../i18n';
import { useAppLauncher } from '../../hooks/useAppLauncher';
import { useMenuFocus } from '../../hooks/useMenuFocus';
import { getAppIcon } from '../shared/appIcons';
import { TASKBAR_Z_INDEX } from '../../types/window.types';
import { portfolioConfig } from '../../config/portfolio.config';
import { Github, Linkedin, Mail, ExternalLink, User, Copy, Package } from 'lucide-react';

interface StartMenuLink {
  icon: React.ReactNode;
  label: string;
  href: string;
  description?: string;
  /** If true, show copy button instead of external link */
  copyable?: boolean;
}

interface StartMenuProps {
  /** The start button that anchors the menu — also excluded from outside-click dismissal. */
  anchorRef: React.RefObject<HTMLButtonElement | null>;
  onClose: () => void;
}

const MENU_WIDTH = 288; // w-72
const EDGE_MARGIN = 8;

/**
 * Start menu popover. Portaled to document.body so its position is independent
 * of the dock's own geometry (an overflowing dock must not push the menu
 * off-screen), clamped to the viewport, and capped in height so every item
 * stays reachable on short screens (the list scrolls instead).
 */
export function StartMenu({ anchorRef, onClose }: StartMenuProps) {
  const menuRef = useRef<HTMLElement>(null);
  const { t } = useTranslation();
  const theme = usePrefsStore((state) => state.theme);

  const entries = useAppRegistry((state) => state.entries);
  const availableApps = useMemo(
    () => Object.values(entries).map((entry) => entry.defaultConfig),
    [entries],
  );
  const launchApp = useAppLauncher();
  const addToast = useToastStore((state) => state.addToast);

  useMenuFocus(menuRef, onClose);

  // Measure the anchor once on open. Safe because any viewport resize closes
  // the menu (see the effect below), so the rect can never go stale.
  const [position] = useState(() => {
    const rect = anchorRef.current?.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const anchorLeft = rect?.left ?? EDGE_MARGIN;
    const anchorTop = rect?.top ?? vh;
    return {
      left: Math.min(Math.max(anchorLeft, EDGE_MARGIN), Math.max(EDGE_MARGIN, vw - MENU_WIDTH - EDGE_MARGIN)),
      bottom: vh - anchorTop + 12,
      maxHeight: Math.max(160, anchorTop - 24),
    };
  });

  useEffect(() => {
    const handleMouseDown = (event: MouseEvent) => {
      const target = event.target as Node;
      // Clicks on the anchor button toggle the menu themselves — closing here
      // too would make the toggle reopen it immediately.
      if (menuRef.current?.contains(target) || anchorRef.current?.contains(target)) return;
      onClose();
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', onClose);
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', onClose);
    };
  }, [anchorRef, onClose]);

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
      onClose();
    } catch {
      addToast({
        message: t('taskbar.copyFailed'),
        type: 'error',
        duration: 3000,
      });
    }
  };

  return createPortal(
    // Portals escape the shell's `.dark` root, so re-scope the theme here —
    // without it every dark: variant and --glass-* token silently breaks.
    <div className={theme === 'dark' ? 'dark' : ''}>
      <LiquidGlass
        ref={menuRef}
        variant="menu"
        role="menu"
        aria-label={t('taskbar.startMenu')}
        className="fixed w-72 flex flex-col overflow-hidden"
        style={{
          left: position.left,
          bottom: position.bottom,
          maxHeight: position.maxHeight,
          zIndex: TASKBAR_Z_INDEX + 1,
        }}
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

        <div className="flex-1 min-h-0 overflow-y-auto">
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
                  role="menuitem"
                  tabIndex={-1}
                  onClick={() => {
                    launchApp(app);
                    onClose();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 focus:bg-black/5 dark:focus:bg-white/10 focus:outline-none transition-colors group"
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
                      role="menuitem"
                      tabIndex={-1}
                      onClick={() => handleCopyEmail(link.href)}
                      className="p-1.5 rounded hover:bg-black/10 dark:hover:bg-white/10 focus:bg-black/10 dark:focus:bg-white/10 focus:outline-none transition-colors"
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
                  role="menuitem"
                  tabIndex={-1}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 focus:bg-black/5 dark:focus:bg-white/10 focus:outline-none transition-colors group"
                  onClick={onClose}
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
        </div>
      </LiquidGlass>
    </div>,
    document.body,
  );
}
