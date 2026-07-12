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
  CASCADE_OFFSET,
} from '../types/window.types';
import { getAppDefaultSize } from '../registry/appRegistry';
import { clampSize, getViewport, getWorkAreaHeight } from '../utils/windowGeometry';

/**
 * Raise the given window to the top and compact all zIndexes to
 * BASE_Z_INDEX..BASE_Z_INDEX+n-1, so they never grow past the taskbar.
 * Returns the same array reference when nothing changed.
 */
const raiseAndNormalize = (windows: WindowState[], id: string): WindowState[] => {
  const order = [...windows].sort((a, b) => a.zIndex - b.zIndex).map((w) => w.id);
  const idx = order.indexOf(id);
  if (idx !== -1) {
    order.splice(idx, 1);
    order.push(id);
  }
  const rank = new Map(order.map((windowId, i) => [windowId, BASE_Z_INDEX + i]));

  let changed = false;
  const next = windows.map((w) => {
    const zIndex = rank.get(w.id) ?? w.zIndex;
    if (zIndex === w.zIndex) return w;
    changed = true;
    return { ...w, zIndex };
  });
  return changed ? next : windows;
};

const getDefaultSize = (): Size => ({
  w: Math.floor(window.innerWidth * 0.5),
  h: Math.floor((window.innerHeight - TASKBAR_HEIGHT) * 0.5),
});

const getCenteredPosition = (size: Size): Position => ({
  x: Math.floor((window.innerWidth - size.w) / 2),
  y: Math.floor((window.innerHeight - TASKBAR_HEIGHT - size.h) / 2),
});

/**
 * Center + cascade: each already-open window pushes the new one
 * CASCADE_OFFSET px down-right, wrapping back to center when the
 * window would leave the work area.
 */
const getCascadePosition = (size: Size, openCount: number): Position => {
  const viewport = getViewport();
  const base = getCenteredPosition(size);
  const room = Math.max(
    0,
    Math.min(
      viewport.width - size.w - base.x,
      getWorkAreaHeight(viewport) - size.h - base.y,
    ),
  );
  const steps = Math.floor(room / CASCADE_OFFSET) + 1;
  const offset = (openCount % steps) * CASCADE_OFFSET;
  return { x: base.x + offset, y: base.y + offset };
};

export const useWindowStore = create<WindowStore>((set, get) => ({
  windows: [],
  activeWindowId: null,

  openWindow: (componentType: string, title: string) => {
    const { windows } = get();

    // Single instance: relaunching an open app restores and focuses it
    const existing = windows.find((w) => w.componentType === componentType);
    if (existing) {
      set((state) => ({
        windows: raiseAndNormalize(
          state.windows.map((w) =>
            w.id === existing.id ? { ...w, isMinimized: false } : w
          ),
          existing.id,
        ),
        activeWindowId: existing.id,
      }));
      return;
    }

    const size = clampSize(
      getAppDefaultSize(componentType, getDefaultSize()),
      getViewport(),
    );
    const position = getCascadePosition(size, windows.length);

    const newWindow: WindowState = {
      id: uuidv4(),
      title,
      position,
      size,
      zIndex: BASE_Z_INDEX + windows.length,
      isMinimized: false,
      isMaximized: false,
      componentType,
    };

    set((state) => ({
      windows: raiseAndNormalize([...state.windows, newWindow], newWindow.id),
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
    set((state) => ({
      windows: raiseAndNormalize(state.windows, id),
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
      const windows = state.windows.map((w) => {
        if (w.id !== id) return w;

        if (w.isMinimized) {
          return {
            ...w,
            isMinimized: false,
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
      });

      return {
        windows: raiseAndNormalize(windows, id),
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
