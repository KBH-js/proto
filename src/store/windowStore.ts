import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import {
  WindowState,
  WindowStore,
  Position,
  Size,
  SnapZone,
  BASE_Z_INDEX,
  TASKBAR_HEIGHT,
  DEFAULT_MIN_SIZE,
  CASCADE_OFFSET,
} from '../types/window.types';
import { isSmallScreen } from '../utils/device';
import {
  clampPosition,
  clampSize,
  getSnapRect,
  getViewport,
  getWorkAreaHeight,
  Viewport,
} from '../utils/windowGeometry';

/**
 * Refit one window to the given viewport: maximized/snapped windows are
 * recomputed from their zone, floating windows are clamped on screen.
 */
const fitWindowToViewport = (w: WindowState, viewport: Viewport): WindowState => {
  const prevSize = w.prevSize ? clampSize(w.prevSize, viewport) : undefined;
  const prevPosition =
    w.prevPosition && prevSize
      ? clampPosition(w.prevPosition, prevSize, viewport)
      : undefined;

  if (w.isMaximized) {
    const rect = getSnapRect('top', viewport);
    return { ...w, ...rect, prevPosition, prevSize };
  }
  if (w.snapZone) {
    const rect = getSnapRect(w.snapZone, viewport);
    return { ...w, ...rect, prevPosition, prevSize };
  }

  const size = clampSize(w.size, viewport);
  const position = clampPosition(w.position, size, viewport);
  return { ...w, position, size, prevPosition, prevSize };
};

const isValidPoint = (p: unknown): p is { x: number; y: number } =>
  typeof p === 'object' && p !== null &&
  Number.isFinite((p as Position).x) && Number.isFinite((p as Position).y);

const isValidSize = (s: unknown): s is Size =>
  typeof s === 'object' && s !== null &&
  Number.isFinite((s as Size).w) && Number.isFinite((s as Size).h);

const isValidWindow = (w: unknown): w is WindowState => {
  const win = w as WindowState;
  return (
    typeof win === 'object' && win !== null &&
    typeof win.id === 'string' &&
    typeof win.title === 'string' &&
    typeof win.componentType === 'string' &&
    typeof win.isMinimized === 'boolean' &&
    typeof win.isMaximized === 'boolean' &&
    typeof win.zIndex === 'number' &&
    isValidPoint(win.position) &&
    isValidSize(win.size)
  );
};

/**
 * Rebuild persisted windows for the current viewport: drop malformed
 * entries, refit geometry, compact zIndexes, and derive the active
 * window (topmost non-minimized). Windows whose app isn't registered
 * yet are kept — the remote catalog resolves asynchronously.
 */
const sanitizeWindows = (
  raw: unknown,
  viewport: Viewport,
): { windows: WindowState[]; activeWindowId: string | null } => {
  const list = Array.isArray(raw) ? raw.filter(isValidWindow) : [];

  const ordered = [...list].sort((a, b) => a.zIndex - b.zIndex);
  const windows = list.map((w) => ({
    ...fitWindowToViewport(w, viewport),
    zIndex: BASE_Z_INDEX + ordered.indexOf(w),
  }));

  const visible = windows.filter((w) => !w.isMinimized);
  const activeWindowId = visible.length
    ? visible.reduce((prev, curr) => (prev.zIndex > curr.zIndex ? prev : curr)).id
    : null;

  return { windows, activeWindowId };
};

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

/**
 * Horizontal space reserved for the left app-launcher rail:
 * pl-3 (12) + dock padding (2×8) + icon width (80) + breathing room.
 * Fresh windows open to the RIGHT of this so the launcher stays visible.
 */
const APP_RAIL_RESERVE = 124;

/** Cap so ultrawide monitors don't get an absurdly wide default window */
const MAX_DEFAULT_WIDTH = 1080;

/**
 * One uniform default size for every app (per-app defaultSize is no longer
 * consulted): a large window filling most of the work area — the region
 * left over after the app rail (left) and the taskbar (bottom).
 */
const getDefaultSize = (): Size => {
  const availW = Math.max(
    DEFAULT_MIN_SIZE.w,
    window.innerWidth - APP_RAIL_RESERVE - 16,
  );
  const workH = window.innerHeight - TASKBAR_HEIGHT;
  return {
    w: Math.floor(Math.min(availW * 0.78, MAX_DEFAULT_WIDTH)),
    h: Math.floor(workH * 0.8),
  };
};

const getCenteredPosition = (size: Size): Position => ({
  // Centered within the area right of the app rail — never over the
  // launcher; the cascade only pushes further down-right from here.
  x: Math.max(
    APP_RAIL_RESERVE,
    APP_RAIL_RESERVE + Math.floor((window.innerWidth - APP_RAIL_RESERVE - size.w) / 2),
  ),
  y: Math.max(12, Math.floor((window.innerHeight - TASKBAR_HEIGHT - size.h) / 2)),
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

export const useWindowStore = create<WindowStore>()(
  persist(
    (set, get) => ({
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

    const viewport = getViewport();
    const size = clampSize(getDefaultSize(), viewport);
    const position = getCascadePosition(size, windows.length);

    // Small screens get no useful floating layout — open maximized,
    // keeping the floating rect for restore
    const openMaximized = isSmallScreen();
    const maximizedRect = getSnapRect('top', viewport);

    const newWindow: WindowState = {
      id: uuidv4(),
      title,
      position: openMaximized ? maximizedRect.position : position,
      size: openMaximized ? maximizedRect.size : size,
      prevPosition: openMaximized ? position : undefined,
      prevSize: openMaximized ? size : undefined,
      zIndex: BASE_Z_INDEX + windows.length,
      isMinimized: false,
      isMaximized: openMaximized,
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

  minimizeAll: () => {
    set((state) => ({
      windows: state.windows.map((w) => (w.isMinimized ? w : { ...w, isMinimized: true })),
      activeWindowId: null,
    }));
  },

  maximizeWindow: (id: string) => {
    set((state) => ({
      windows: state.windows.map((w) => {
        if (w.id !== id) return w;

        // Keep the original floating rect when already snapped, so
        // restore never lands on a tiled geometry
        const keepPrev = w.snapZone !== undefined && w.prevSize !== undefined;

        return {
          ...w,
          prevPosition: keepPrev ? w.prevPosition : w.position,
          prevSize: keepPrev ? w.prevSize : w.size,
          snapZone: undefined,
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

  snapWindow: (id: string, zone: SnapZone) => {
    if (zone === 'top') {
      get().maximizeWindow(id);
      return;
    }

    const { position, size } = getSnapRect(zone, getViewport());

    set((state) => ({
      windows: state.windows.map((w) => {
        if (w.id !== id) return w;

        // Chained snaps (left → right) must keep the original floating rect
        const keepPrev =
          (w.snapZone !== undefined || w.isMaximized) && w.prevSize !== undefined;

        return {
          ...w,
          prevPosition: keepPrev ? w.prevPosition : w.position,
          prevSize: keepPrev ? w.prevSize : w.size,
          snapZone: zone,
          isMaximized: false,
          position,
          size,
        };
      }),
    }));
  },

  unsnapWindow: (id: string, pointer: Position) => {
    set((state) => ({
      windows: state.windows.map((w) => {
        if (w.id !== id || w.snapZone === undefined) return w;

        const viewport = getViewport();
        const size = clampSize(w.prevSize ?? getDefaultSize(), viewport);

        // Keep the current position whenever the pointer still lands on
        // the restored titlebar: changing the controlled position while
        // react-draggable is mid-drag re-bases its state and drops the
        // drag deltas accumulated until React commits, making the window
        // trail the cursor. Only re-base when the grab point would fall
        // outside the restored width.
        const pointerOnTitlebar =
          pointer.x >= w.position.x && pointer.x <= w.position.x + size.w;
        const position = pointerOnTitlebar
          ? w.position
          : clampPosition(
              { x: Math.round(pointer.x - size.w / 2), y: w.position.y },
              size,
              viewport,
            );

        return {
          ...w,
          snapZone: undefined,
          prevPosition: undefined,
          prevSize: undefined,
          position,
          size,
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
        w.id === id
          ? {
              ...w,
              position: clampPosition(position, w.size, getViewport()),
              snapZone: undefined,
            }
          : w
      ),
    }));
  },

  updateWindowSize: (id: string, size: Size) => {
    const constrainedSize: Size = {
      w: Math.max(size.w, DEFAULT_MIN_SIZE.w),
      h: Math.max(size.h, DEFAULT_MIN_SIZE.h),
    };

    // Manual resize un-tiles the window
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, size: constrainedSize, snapZone: undefined } : w
      ),
    }));
  },

  handleViewportResize: () => {
    const viewport = getViewport();
    set((state) => ({
      windows: state.windows.map((w) => fitWindowToViewport(w, viewport)),
    }));
  },
    }),
    {
      name: 'proto-desktop:windows',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      // activeWindowId is derived on rehydrate; drag-time state never persists
      partialize: (state) => ({ windows: state.windows }),
      migrate: (persisted, version) =>
        version === 1 ? (persisted as { windows: WindowState[] }) : { windows: [] },
      // Spread current first so store actions survive the merge
      merge: (persisted, current) => ({
        ...current,
        ...sanitizeWindows(
          (persisted as { windows?: unknown } | undefined)?.windows,
          getViewport(),
        ),
      }),
    },
  ),
);
