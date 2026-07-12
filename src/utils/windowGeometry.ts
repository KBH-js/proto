import {
  Position,
  Size,
  SnapZone,
  DEFAULT_MIN_SIZE,
  TASKBAR_HEIGHT,
  TITLEBAR_HEIGHT,
  SNAP_EDGE_THRESHOLD,
  SNAP_CORNER_SIZE,
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

/**
 * Target rect for a snap zone: halves for left/right, quarters for
 * corners, the full work area for 'top' (maximize).
 */
export function getSnapRect(
  zone: SnapZone,
  viewport: Viewport,
): { position: Position; size: Size } {
  const workH = getWorkAreaHeight(viewport);
  const halfW = Math.floor(viewport.width / 2);
  const halfH = Math.floor(workH / 2);
  const rightX = viewport.width - halfW;
  const bottomY = workH - halfH;

  const rect = (() => {
    switch (zone) {
      case 'top':
        return { position: { x: 0, y: 0 }, size: { w: viewport.width, h: workH } };
      case 'left':
        return { position: { x: 0, y: 0 }, size: { w: halfW, h: workH } };
      case 'right':
        return { position: { x: rightX, y: 0 }, size: { w: halfW, h: workH } };
      case 'top-left':
        return { position: { x: 0, y: 0 }, size: { w: halfW, h: halfH } };
      case 'top-right':
        return { position: { x: rightX, y: 0 }, size: { w: halfW, h: halfH } };
      case 'bottom-left':
        return { position: { x: 0, y: bottomY }, size: { w: halfW, h: halfH } };
      case 'bottom-right':
        return { position: { x: rightX, y: bottomY }, size: { w: halfW, h: halfH } };
    }
  })();

  return { position: rect.position, size: clampSize(rect.size, viewport) };
}

/**
 * Map a pointer location to the snap zone it arms, or null when the
 * pointer is away from the edges. Corner zones win over the top edge,
 * which wins over plain left/right. The bottom edge is the taskbar and
 * never snaps. Coordinates outside the viewport (pointer dragged past
 * the window edge) still resolve to their nearest zone.
 */
export function detectSnapZone(px: number, py: number, viewport: Viewport): SnapZone | null {
  const workH = getWorkAreaHeight(viewport);
  const nearLeft = px <= SNAP_EDGE_THRESHOLD;
  const nearRight = px >= viewport.width - SNAP_EDGE_THRESHOLD;
  const nearTop = py <= SNAP_EDGE_THRESHOLD;

  if (nearLeft || nearRight) {
    const side = nearLeft ? 'left' : 'right';
    if (py <= SNAP_CORNER_SIZE) return `top-${side}`;
    if (py >= workH - SNAP_CORNER_SIZE) return `bottom-${side}`;
    return side;
  }
  if (nearTop) return 'top';
  return null;
}
