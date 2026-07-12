import {
  Position,
  Size,
  DEFAULT_MIN_SIZE,
  TASKBAR_HEIGHT,
  TITLEBAR_HEIGHT,
} from '../types/window.types';

export interface Viewport {
  width: number;
  height: number;
}

export const getViewport = (): Viewport => ({
  width: window.innerWidth,
  height: window.innerHeight,
});

/** Height of the desktop area above the taskbar */
export const getWorkAreaHeight = (viewport: Viewport): number =>
  viewport.height - TASKBAR_HEIGHT;

/**
 * Clamp a window size to fit the work area (and never below the minimum)
 */
export function clampSize(size: Size, viewport: Viewport): Size {
  const maxW = Math.max(DEFAULT_MIN_SIZE.w, viewport.width);
  const maxH = Math.max(DEFAULT_MIN_SIZE.h, getWorkAreaHeight(viewport));
  return {
    w: Math.min(Math.max(size.w, DEFAULT_MIN_SIZE.w), maxW),
    h: Math.min(Math.max(size.h, DEFAULT_MIN_SIZE.h), maxH),
  };
}

/**
 * Clamp a window position so it stays on screen and its titlebar
 * never disappears behind the taskbar.
 */
export function clampPosition(position: Position, size: Size, viewport: Viewport): Position {
  const maxX = Math.max(0, viewport.width - size.w);
  const maxY = Math.max(0, viewport.height - TASKBAR_HEIGHT - TITLEBAR_HEIGHT);
  return {
    x: Math.min(Math.max(position.x, 0), maxX),
    y: Math.min(Math.max(position.y, 0), maxY),
  };
}
