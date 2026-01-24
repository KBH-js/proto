import { WindowState } from '../../types/window.types';
import { getApp } from '../../registry/appRegistry';

interface TaskbarItemProps {
  /** The window state object */
  window: WindowState;
  /** Whether this window is currently active/focused */
  isActive: boolean;
  /** Click handler for the taskbar item */
  onClick: () => void;
}

/**
 * Individual taskbar item showing a window's icon and title.
 * Indicates active state and minimized state visually.
 */
export function TaskbarItem({ window, isActive, onClick }: TaskbarItemProps) {
  const app = getApp(window.componentType);
  const icon = app?.defaultConfig.icon ?? '📄';

  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 px-3 py-1.5 rounded-lg
        transition-all duration-150
        ${isActive 
          ? 'bg-white/20 shadow-sm' 
          : 'hover:bg-white/10'
        }
        ${window.isMinimized ? 'opacity-60' : ''}
      `}
      title={window.title}
    >
      <span className="text-lg">{icon}</span>
      <span className="text-sm text-white truncate max-w-[120px]">
        {window.title}
      </span>
      
      {/* Active indicator dot */}
      {isActive && (
        <span className="w-1.5 h-1.5 rounded-full bg-white ml-1" />
      )}
    </button>
  );
}
