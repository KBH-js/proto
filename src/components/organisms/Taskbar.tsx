import { useState, useRef, useEffect, useMemo } from 'react';
import { useWindowStore } from '../../store/windowStore';
import { useToastStore } from '../../store/toastStore';
import { useAppRegistry } from '../../registry/appRegistry';
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
  Package
} from 'lucide-react';

interface StartMenuLink {
  icon: React.ReactNode;
  label: string;
  href: string;
  description?: string;
  /** If true, show copy button instead of external link */
  copyable?: boolean;
}

const externalLinks: StartMenuLink[] = [
  {
    icon: <Github className="w-5 h-5" />,
    label: 'GitHub',
    href: portfolioConfig.links.github,
    description: 'View source code',
  },
  {
    icon: <Linkedin className="w-5 h-5" />,
    label: 'LinkedIn',
    href: portfolioConfig.links.linkedin,
    description: 'Professional profile',
  },
  {
    icon: <Mail className="w-5 h-5" />,
    label: 'Email',
    href: portfolioConfig.owner.email,
    description: 'Get in touch',
    copyable: true,
  },
];

export function Taskbar() {
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);
  const startMenuRef = useRef<HTMLDivElement>(null);
  
  const windows = useWindowStore((state) => state.windows);
  const activeWindowId = useWindowStore((state) => state.activeWindowId);
  const minimizeWindow = useWindowStore((state) => state.minimizeWindow);
  const restoreWindow = useWindowStore((state) => state.restoreWindow);
  const focusWindow = useWindowStore((state) => state.focusWindow);

  const entries = useAppRegistry((state) => state.entries);
  const availableApps = useMemo(
    () => Object.values(entries).map((entry) => entry.defaultConfig),
    [entries],
  );
  const launchApp = useAppLauncher();

  const addToast = useToastStore((state) => state.addToast);

  const handleCopyEmail = async (email: string) => {
    try {
      await navigator.clipboard.writeText(email);
      addToast({
        message: "이메일 주소가 클립보드에 복사되었습니다.",
        type: "success",
        duration: 3000,
      });
      setIsStartMenuOpen(false);
    } catch {
      addToast({
        message: "복사에 실패했습니다.",
        type: "error",
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
      className="fixed bottom-0 left-0 right-0 flex items-center px-2"
      style={{
        height: TASKBAR_HEIGHT,
        zIndex: TASKBAR_Z_INDEX,
      }}
    >
      {/* Liquid-glass background */}
      <div className="absolute inset-0 glass-chrome border-t border-white/40" />

      {/* Start Button */}
      <div className="relative" ref={startMenuRef}>
        <button
          onClick={() => setIsStartMenuOpen(!isStartMenuOpen)}
          className={`
            relative flex items-center justify-center w-10 h-10 rounded-lg
            transition-all duration-200
            ${isStartMenuOpen
              ? 'bg-accent/20 text-accent'
              : 'hover:bg-black/5 text-gray-700'
            }
          `}
          title="Start Menu"
        >
          <Terminal className="w-5 h-5" />
        </button>

        {/* Start Menu Dropdown */}
        {isStartMenuOpen && (
          <div
            className="absolute bottom-full left-0 mb-2 w-72 glass-chrome rounded-2xl border border-white/50 shadow-2xl overflow-hidden"
            style={{ zIndex: TASKBAR_Z_INDEX + 1 }}
          >
            {/* Header */}
            <div className="px-4 py-3 bg-white/30 border-b border-black/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-500 to-accent flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-gray-800 font-semibold">KBH-Desktop</h3>
                </div>
              </div>
            </div>

            {/* Apps */}
            <div className="p-2 border-b border-black/5">
              <p className="px-2 py-1 text-xs text-gray-500 uppercase tracking-wider">Apps</p>
              {availableApps.map((app) => {
                const AppIcon = getAppIcon(app.icon) ?? Package;
                return (
                  <button
                    key={app.componentType}
                    onClick={() => {
                      launchApp(app);
                      setIsStartMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-black/5 transition-colors group"
                  >
                    <AppIcon className="w-5 h-5 text-gray-500 group-hover:text-gray-800 transition-colors" />
                    <span className="flex-1 text-left text-sm text-gray-800">{app.title}</span>
                    {app.externalUrl && (
                      <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-gray-600" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* External Links */}
            <div className="p-2">
              <p className="px-2 py-1 text-xs text-gray-500 uppercase tracking-wider">Connect</p>
              {externalLinks.map((link) => {
                if (link.copyable) {
                  return (
                    <div
                      key={link.label}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-black/5 transition-colors group"
                    >
                      <span className="text-gray-500 group-hover:text-gray-800 transition-colors">
                        {link.icon}
                      </span>
                      <div className="flex-1">
                        <span className="text-sm text-gray-800">{link.label}</span>
                        {link.description && (
                          <p className="text-xs text-gray-500">{link.href}</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleCopyEmail(link.href)}
                        className="p-1.5 rounded hover:bg-black/10 transition-colors"
                        title="Copy email address"
                      >
                        <Copy className="w-4 h-4 text-gray-500 hover:text-gray-800" />
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
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-black/5 transition-colors group"
                    onClick={() => setIsStartMenuOpen(false)}
                  >
                    <span className="text-gray-500 group-hover:text-gray-800 transition-colors">
                      {link.icon}
                    </span>
                    <div className="flex-1">
                      <span className="text-sm text-gray-800">{link.label}</span>
                      {link.description && (
                        <p className="text-xs text-gray-500">{link.description}</p>
                      )}
                    </div>
                    <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-gray-600" />
                  </a>
                );
              })}
            </div>

          </div>
        )}
      </div>

      {/* Separator */}
      <div className="relative w-px h-6 bg-black/10 mx-2" />

      {/* Taskbar items container */}
      <div className="relative flex-1 flex items-center justify-center gap-1">
        {windows.length === 0 ? (
          <span className="text-gray-600 text-sm">No open windows</span>
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
  );
}
