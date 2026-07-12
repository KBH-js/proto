import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import {
  WindowState,
  WindowStore,
  Position,
  Size,
  BASE_Z_INDEX,
  TASKBAR_HEIGHT,
  DEFAULT_MIN_SIZE,
} from '../types/window.types';

const getNextZIndex = (windows: WindowState[]): number => {
  if (windows.length === 0) return BASE_Z_INDEX;
  const maxZ = Math.max(...windows.map((w) => w.zIndex));
  return maxZ + 1;
};

const getDefaultSize = (): Size => ({
  w: Math.floor(window.innerWidth * 0.5),
  h: Math.floor((window.innerHeight - TASKBAR_HEIGHT) * 0.5),
});

const getCenteredPosition = (size: Size): Position => ({
  x: Math.floor((window.innerWidth - size.w) / 2),
  y: Math.floor((window.innerHeight - TASKBAR_HEIGHT - size.h) / 2),
});

export const useWindowStore = create<WindowStore>((set, get) => ({
  windows: [],
  activeWindowId: null,

  openWindow: (componentType: string, title: string) => {
    const size = getDefaultSize();
    const position = getCenteredPosition(size);
    const { windows } = get();

    const newWindow: WindowState = {
      id: uuidv4(),
      title,
      position,
      size,
      zIndex: getNextZIndex(windows),
      isMinimized: false,
      isMaximized: false,
      componentType,
    };

    set((state) => ({
      windows: [...state.windows, newWindow],
      activeWindowId: newWindow.id,
    }));
  },

  closeWindow: (id: string) => {
    set((state) => {
      const newWindows = state.windows.filter((w) => w.id !== id);
      // If closing the active window, set active to the topmost remaining window
      let newActiveId = state.activeWindowId;
      if (state.activeWindowId === id) {
        if (newWindows.length > 0) {
          const topWindow = newWindows.reduce((prev, curr) =>
            prev.zIndex > curr.zIndex ? prev : curr
          );
          newActiveId = topWindow.id;
        } else {
          newActiveId = null;
        }
      }
      return {
        windows: newWindows,
        activeWindowId: newActiveId,
      };
    });
  },

  focusWindow: (id: string) => {
    const { windows } = get();
    const nextZIndex = getNextZIndex(windows);

    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, zIndex: nextZIndex } : w
      ),
      activeWindowId: id,
    }));
  },

  minimizeWindow: (id: string) => {
    set((state) => {
      const newWindows = state.windows.map((w) =>
        w.id === id ? { ...w, isMinimized: true } : w
      );

      // If minimizing the active window, find the next visible window to focus
      let newActiveId = state.activeWindowId;
      if (state.activeWindowId === id) {
        const visibleWindows = newWindows.filter((w) => !w.isMinimized);
        if (visibleWindows.length > 0) {
          const topWindow = visibleWindows.reduce((prev, curr) =>
            prev.zIndex > curr.zIndex ? prev : curr
          );
          newActiveId = topWindow.id;
        } else {
          newActiveId = null;
        }
      }

      return {
        windows: newWindows,
        activeWindowId: newActiveId,
      };
    });
  },

  maximizeWindow: (id: string) => {
    set((state) => ({
      windows: state.windows.map((w) => {
        if (w.id !== id) return w;

        // Store current position/size for restore
        return {
          ...w,
          prevPosition: w.position,
          prevSize: w.size,
          isMaximized: true,
          position: { x: 0, y: 0 },
          size: {
            w: window.innerWidth,
            h: window.innerHeight - TASKBAR_HEIGHT,
          },
        };
      }),
    }));
  },

  restoreWindow: (id: string) => {
    set((state) => {
      const { windows } = state;
      const nextZIndex = getNextZIndex(windows);

      return {
        windows: windows.map((w) => {
          if (w.id !== id) return w;

          if (w.isMinimized) {
            return {
              ...w,
              isMinimized: false,
              zIndex: nextZIndex,
            };
          }

          if (w.isMaximized) {
            return {
              ...w,
              isMaximized: false,
              position: w.prevPosition ?? getCenteredPosition(w.prevSize ?? getDefaultSize()),
              size: w.prevSize ?? getDefaultSize(),
              prevPosition: undefined,
              prevSize: undefined,
            };
          }

          return w;
        }),
        activeWindowId: id,
      };
    });
  },

  updateWindowPosition: (id: string, position: Position) => {
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, position } : w
      ),
    }));
  },

  updateWindowSize: (id: string, size: Size) => {
    const constrainedSize: Size = {
      w: Math.max(size.w, DEFAULT_MIN_SIZE.w),
      h: Math.max(size.h, DEFAULT_MIN_SIZE.h),
    };

    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, size: constrainedSize } : w
      ),
    }));
  },
}));
