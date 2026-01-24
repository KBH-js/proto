import { useWindowStore } from '../../store/windowStore';
import { TASKBAR_HEIGHT, TASKBAR_Z_INDEX } from '../../types/window.types';
import { TaskbarItem } from '../molecules/TaskbarItem';

/**
 * Taskbar / Dock component fixed at the bottom of the viewport.
 * Shows all open windows and allows toggling minimize/restore.
 */
export function Taskbar() {
  const {
    windows,
    activeWindowId,
    minimizeWindow,
    restoreWindow,
    focusWindow,
  } = useWindowStore();

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
      className="fixed bottom-0 left-0 right-0 flex items-center justify-center gap-1 px-4"
      style={{
        height: TASKBAR_HEIGHT,
        zIndex: TASKBAR_Z_INDEX,
      }}
    >
      {/* Glassmorphism background */}
      <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-md border-t border-white/10" />

      {/* Taskbar items container */}
      <div className="relative flex items-center gap-1">
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
