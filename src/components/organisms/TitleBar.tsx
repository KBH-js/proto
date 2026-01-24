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
        ${isActive
          ? 'bg-gray-200'
          : 'bg-gray-300'
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

      {/* Spacer for balance (same width as controls) */}
      <div className="flex-shrink-0 w-[52px]" />
    </div>
  );
}
