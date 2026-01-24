import { WindowControls } from '../molecules/WindowControls';

interface TitleBarProps {
  /** Window title to display */
  title: string;
  /** Whether the window is currently active/focused */
  isActive: boolean;
  /** Whether the window is maximized */
  isMaximized: boolean;
  /** Close button handler */
  onClose: () => void;
  /** Minimize button handler */
  onMinimize: () => void;
  /** Maximize/Restore button handler */
  onMaximize: () => void;
  /** Whether this window contains a remote micro-frontend */
  isRemote?: boolean;
  /** Port the remote is served from (for display) */
  remotePort?: number;
}

/** CSS class name used by react-rnd for drag handle */
export const DRAG_HANDLE_CLASS = 'window-drag-handle';

/**
 * Window title bar with macOS-style traffic light controls.
 * The title bar serves as the drag handle for moving windows.
 */
export function TitleBar({
  title,
  isActive,
  isMaximized,
  onClose,
  onMinimize,
  onMaximize,
  isRemote = false,
  remotePort,
}: TitleBarProps) {
  const handleDoubleClick = () => {
    onMaximize();
  };

  return (
    <div
      className={`
        ${DRAG_HANDLE_CLASS}
        flex items-center h-9 px-3
        rounded-t-lg
        select-none
        ${isRemote
          ? (isActive ? 'bg-gradient-to-r from-cyan-900/30 to-gray-200' : 'bg-gradient-to-r from-cyan-900/20 to-gray-300')
          : (isActive ? 'bg-gray-200' : 'bg-gray-300')
        }
        ${!isMaximized ? 'cursor-move' : 'cursor-default'}
      `}
      onDoubleClick={handleDoubleClick}
    >
      {/* Traffic light controls on the left */}
      <div className="flex-shrink-0">
        <WindowControls
          onClose={onClose}
          onMinimize={onMinimize}
          onMaximize={onMaximize}
          isActive={isActive}
        />
      </div>

      {/* Remote Badge */}
      {isRemote && (
        <div className="flex-shrink-0 ml-2">
          <span
            className={`
              inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider
              ${isActive 
                ? 'bg-cyan-500 text-white shadow-sm shadow-cyan-500/50' 
                : 'bg-cyan-600/50 text-cyan-100'
              }
            `}
            title={remotePort ? `Loaded from localhost:${remotePort}` : 'Remote micro-frontend'}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            REMOTE
            {remotePort && <span className="text-cyan-200 font-normal">:{remotePort}</span>}
          </span>
        </div>
      )}

      {/* Centered title */}
      <div className="flex-1 text-center">
        <span
          className={`
            text-sm font-medium truncate
            ${isActive ? 'text-gray-800' : 'text-gray-500'}
          `}
        >
          {title}
        </span>
      </div>

      {/* Spacer for balance (same width as controls + badge space) */}
      <div className={`flex-shrink-0 ${isRemote ? 'w-[120px]' : 'w-[52px]'}`} />
    </div>
  );
}
