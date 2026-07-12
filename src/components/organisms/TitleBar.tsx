import { WindowControls } from '../molecules/WindowControls';
import { isDevelopment } from '../../config/portfolio.config';

interface TitleBarProps {
  title: string;
  isActive: boolean;
  isMaximized: boolean;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  /** Whether this window contains a remote micro-frontend */
  isRemote?: boolean;
}

/** CSS class name used by react-rnd for drag handle */
export const DRAG_HANDLE_CLASS = 'window-drag-handle';

export function TitleBar({
  title,
  isActive,
  isMaximized,
  onClose,
  onMinimize,
  onMaximize,
  isRemote = false,
}: TitleBarProps) {
  const handleDoubleClick = () => {
    onMaximize();
  };

  const remoteBadgeLabel = isDevelopment ? 'MFE:DEV' : 'MFE';
  const remoteTooltip = isDevelopment 
    ? 'Module Federation - Development (localhost)' 
    : 'Module Federation - Loaded from Vercel';

  return (
    <div
      className={`
        ${DRAG_HANDLE_CLASS}
        flex items-center h-9 px-3
        rounded-t-2xl
        select-none
        border-b border-white/30
        ${isActive ? 'glass-chrome' : 'glass-chrome-muted'}
        ${!isMaximized ? 'cursor-move' : 'cursor-default'}
      `}
      onDoubleClick={handleDoubleClick}
    >
      <div className="flex-shrink-0">
        <WindowControls
          onClose={onClose}
          onMinimize={onMinimize}
          onMaximize={onMaximize}
          isActive={isActive}
        />
      </div>

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
            title={remoteTooltip}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            {remoteBadgeLabel}
          </span>
        </div>
      )}

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
      <div className={`flex-shrink-0 ${isRemote ? 'w-[100px]' : 'w-[52px]'}`} />
    </div>
  );
}
