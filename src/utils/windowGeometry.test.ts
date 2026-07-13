import { describe, it, expect } from 'vitest';
import {
  clampSize,
  clampPosition,
  getSnapRect,
  detectSnapZone,
  type Viewport,
} from './windowGeometry';
import {
  DEFAULT_MIN_SIZE,
  TASKBAR_HEIGHT,
  TITLEBAR_HEIGHT,
} from '../types/window.types';

// A representative viewport; workarea height = 800 - 52 = 748.
const VP: Viewport = { width: 1000, height: 800 };
const WORK_H = VP.height - TASKBAR_HEIGHT; // 748

describe('clampSize', () => {
  it('floors below the minimum size', () => {
    expect(clampSize({ w: 50, h: 50 }, VP)).toEqual(DEFAULT_MIN_SIZE);
  });

  it('caps to the work area', () => {
    expect(clampSize({ w: 5000, h: 5000 }, VP)).toEqual({ w: 1000, h: WORK_H });
  });

  it('passes a size that already fits through unchanged', () => {
    expect(clampSize({ w: 400, h: 300 }, VP)).toEqual({ w: 400, h: 300 });
  });
});

describe('clampPosition', () => {
  const size = { w: 400, h: 300 };

  it('clamps negative coordinates to the top-left', () => {
    expect(clampPosition({ x: -50, y: -50 }, size, VP)).toEqual({ x: 0, y: 0 });
  });

  it('keeps the titlebar reachable above the taskbar', () => {
    const maxY = VP.height - TASKBAR_HEIGHT - TITLEBAR_HEIGHT; // 712
    expect(clampPosition({ x: 5000, y: 5000 }, size, VP)).toEqual({
      x: VP.width - size.w, // 600
      y: maxY,
    });
  });

  it('passes an on-screen position through unchanged', () => {
    expect(clampPosition({ x: 100, y: 100 }, size, VP)).toEqual({ x: 100, y: 100 });
  });
});

describe('getSnapRect', () => {
  it("'top' fills the whole work area (maximize)", () => {
    expect(getSnapRect('top', VP)).toEqual({
      position: { x: 0, y: 0 },
      size: { w: 1000, h: WORK_H },
    });
  });

  it('halves the work area for left/right', () => {
    expect(getSnapRect('left', VP)).toEqual({
      position: { x: 0, y: 0 },
      size: { w: 500, h: WORK_H },
    });
    expect(getSnapRect('right', VP)).toEqual({
      position: { x: 500, y: 0 },
      size: { w: 500, h: WORK_H },
    });
  });

  it('quarters the work area for corners', () => {
    const halfH = Math.floor(WORK_H / 2); // 374
    expect(getSnapRect('top-left', VP)).toEqual({
      position: { x: 0, y: 0 },
      size: { w: 500, h: halfH },
    });
    expect(getSnapRect('bottom-right', VP)).toEqual({
      position: { x: 500, y: WORK_H - halfH },
      size: { w: 500, h: halfH },
    });
  });
});

describe('detectSnapZone', () => {
  it('returns null away from every edge', () => {
    expect(detectSnapZone(500, 400, VP)).toBeNull();
  });

  it('arms plain left/right on a mid-height edge', () => {
    expect(detectSnapZone(5, 400, VP)).toBe('left');
    expect(detectSnapZone(995, 400, VP)).toBe('right');
  });

  it('prefers a corner zone near screen corners', () => {
    expect(detectSnapZone(5, 50, VP)).toBe('top-left');
    expect(detectSnapZone(5, 700, VP)).toBe('bottom-left');
    expect(detectSnapZone(995, 50, VP)).toBe('top-right');
  });

  it("arms 'top' on the top edge away from corners", () => {
    expect(detectSnapZone(500, 5, VP)).toBe('top');
  });

  it('never snaps the bottom (taskbar) edge', () => {
    expect(detectSnapZone(500, VP.height - 1, VP)).toBeNull();
  });

  it('resolves coordinates dragged just outside the viewport', () => {
    expect(detectSnapZone(-5, 50, VP)).toBe('top-left');
  });
});
