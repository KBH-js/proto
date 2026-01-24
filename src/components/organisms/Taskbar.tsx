import { useState, useRef, useEffect } from 'react';
import { useWindowStore } from '../../store/windowStore';
import { useToastStore } from '../../store/toastStore';
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
  Copy
} from 'lucide-react';

interface StartMenuLink {
  icon: React.ReactNode;
  label: string;
  href: string;
  description?: string;
  /** If true, show copy button instead of external link */
  copyable?: boolean;
}

// Build external links from portfolio config
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
    href: portfolioConfig.owner.email, // Raw email address
    description: 'Get in touch',
    copyable: true,
  },
];

/**
 * Taskbar / Dock component fixed at the bottom of the viewport.
 * Shows all open windows, Start Menu with external links, and allows toggling minimize/restore.
 */
export function Taskbar() {
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);
  const startMenuRef = useRef<HTMLDivElement>(null);
  
  const {
    windows,
    activeWindowId,
    minimizeWindow,
    restoreWindow,
    focusWindow,
  } = useWindowStore();

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
      // Restore and focus the minimized window
      restoreWindow(windowId);
      focusWindow(windowId);
    } else if (isActive) {
      // Only minimize if clicking the already-active window
      minimizeWindow(windowId);
    } else {
      // Bring non-active visible window to focus
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
      {/* Glassmorphism background */}
      <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-md border-t border-white/10" />

      {/* Start Button */}
      <div className="relative" ref={startMenuRef}>
        <button
          onClick={() => setIsStartMenuOpen(!isStartMenuOpen)}
          className={`
            relative flex items-center justify-center w-10 h-10 rounded-lg
            transition-all duration-200
            ${isStartMenuOpen 
              ? 'bg-purple-500/30 text-purple-300' 
              : 'hover:bg-white/10 text-white'
            }
          `}
          title="Start Menu"
        >
          <Terminal className="w-5 h-5" />
        </button>

        {/* Start Menu Dropdown */}
        {isStartMenuOpen && (
          <div 
            className="absolute bottom-full left-0 mb-2 w-72 bg-gray-900/95 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl overflow-hidden"
            style={{ zIndex: TASKBAR_Z_INDEX + 1 }}
          >
            {/* Header */}
            <div className="px-4 py-3 bg-gradient-to-r from-purple-600/30 to-blue-600/30 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">KBH-OS</h3>
                </div>
              </div>
            </div>

            {/* External Links */}
            <div className="p-2">
              <p className="px-2 py-1 text-xs text-gray-500 uppercase tracking-wider">Connect</p>
              {externalLinks.map((link) => {
                // Email with copy button
                if (link.copyable) {
                  return (
                    <div
                      key={link.label}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors group"
                    >
                      <span className="text-gray-400 group-hover:text-white transition-colors">
                        {link.icon}
                      </span>
                      <div className="flex-1">
                        <span className="text-sm text-white">{link.label}</span>
                        {link.description && (
                          <p className="text-xs text-gray-500">{link.href}</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleCopyEmail(link.href)}
                        className="p-1.5 rounded hover:bg-white/20 transition-colors"
                        title="Copy email address"
                      >
                        <Copy className="w-4 h-4 text-gray-400 hover:text-white" />
                      </button>
                    </div>
                  );
                }

                // Regular external link
                return (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors group"
                    onClick={() => setIsStartMenuOpen(false)}
                  >
                    <span className="text-gray-400 group-hover:text-white transition-colors">
                      {link.icon}
                    </span>
                    <div className="flex-1">
                      <span className="text-sm text-white">{link.label}</span>
                      {link.description && (
                        <p className="text-xs text-gray-500">{link.description}</p>
                      )}
                    </div>
                    <ExternalLink className="w-3 h-3 text-gray-600 group-hover:text-gray-400" />
                  </a>
                );
              })}
            </div>

          </div>
        )}
      </div>

      {/* Separator */}
      <div className="relative w-px h-6 bg-white/20 mx-2" />

      {/* Taskbar items container */}
      <div className="relative flex-1 flex items-center justify-center gap-1">
        {windows.length === 0 ? (
          <span className="text-gray-500 text-sm">No open windows</span>
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
