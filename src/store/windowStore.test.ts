import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BASE_Z_INDEX, TASKBAR_HEIGHT } from '../types/window.types';

// Windows must not open maximized during these desktop-sized tests.
vi.mock('../utils/device', () => ({
  isSmallScreen: () => false,
}));

import { useWindowStore } from './windowStore';

const reset = () => {
  useWindowStore.setState({ windows: [], activeWindowId: null });
  localStorage.clear();
};

beforeEach(reset);

describe('openWindow', () => {
  it('opens a window, focuses it, and seeds the base zIndex', () => {
    useWindowStore.getState().openWindow('about', 'About');
    const { windows, activeWindowId } = useWindowStore.getState();

    expect(windows).toHaveLength(1);
    expect(windows[0].componentType).toBe('about');
    expect(windows[0].zIndex).toBe(BASE_Z_INDEX);
    expect(activeWindowId).toBe(windows[0].id);
    expect(windows[0].isMinimized).toBe(false);
  });

  it('is single-instance: relaunching refocuses + restores instead of duplicating', () => {
    const store = useWindowStore.getState();
    store.openWindow('about', 'About');
    const firstId = useWindowStore.getState().windows[0].id;

    store.minimizeWindow(firstId);
    store.openWindow('about', 'About'); // relaunch

    const { windows, activeWindowId } = useWindowStore.getState();
    expect(windows).toHaveLength(1);
    expect(windows[0].id).toBe(firstId);
    expect(windows[0].isMinimized).toBe(false);
    expect(activeWindowId).toBe(firstId);
  });

  it('cascades distinct apps and focuses the newest', () => {
    const store = useWindowStore.getState();
    store.openWindow('about', 'About');
    store.openWindow('resume', 'Resume');

    const { windows, activeWindowId } = useWindowStore.getState();
    expect(windows).toHaveLength(2);
    // Cascade offsets the second window from the first
    expect(windows[1].position).not.toEqual(windows[0].position);
    expect(activeWindowId).toBe(windows[1].id);
    // zIndexes stay compacted from the base
    expect(windows.map((w) => w.zIndex).sort()).toEqual([BASE_Z_INDEX, BASE_Z_INDEX + 1]);
  });
});

describe('focus / close / minimize', () => {
  it('closing the active window promotes the topmost remaining one', () => {
    const store = useWindowStore.getState();
    store.openWindow('about', 'About');
    const aboutId = useWindowStore.getState().windows[0].id;
    store.openWindow('resume', 'Resume');
    const resumeId = useWindowStore.getState().windows[1].id;

    expect(useWindowStore.getState().activeWindowId).toBe(resumeId);
    store.closeWindow(resumeId);

    const { windows, activeWindowId } = useWindowStore.getState();
    expect(windows).toHaveLength(1);
    expect(activeWindowId).toBe(aboutId);
  });

  it('minimizing the active window focuses the next visible one', () => {
    const store = useWindowStore.getState();
    store.openWindow('about', 'About');
    const aboutId = useWindowStore.getState().windows[0].id;
    store.openWindow('resume', 'Resume');
    const resumeId = useWindowStore.getState().windows[1].id;

    store.minimizeWindow(resumeId);

    const state = useWindowStore.getState();
    expect(state.windows.find((w) => w.id === resumeId)!.isMinimized).toBe(true);
    expect(state.activeWindowId).toBe(aboutId);
  });

  it('minimizeAll hides every window and clears the active id', () => {
    const store = useWindowStore.getState();
    store.openWindow('about', 'About');
    store.openWindow('resume', 'Resume');

    store.minimizeAll();

    const state = useWindowStore.getState();
    expect(state.windows.every((w) => w.isMinimized)).toBe(true);
    expect(state.activeWindowId).toBeNull();
  });

  it('restoring a minimized window re-activates it', () => {
    const store = useWindowStore.getState();
    store.openWindow('about', 'About');
    const id = useWindowStore.getState().windows[0].id;

    store.minimizeWindow(id);
    store.restoreWindow(id);

    const state = useWindowStore.getState();
    expect(state.windows[0].isMinimized).toBe(false);
    expect(state.activeWindowId).toBe(id);
  });
});

describe('snapping', () => {
  it('tiles a window to the left half and records the zone', () => {
    const store = useWindowStore.getState();
    store.openWindow('about', 'About');
    const id = useWindowStore.getState().windows[0].id;

    store.snapWindow(id, 'left');

    const w = useWindowStore.getState().windows[0];
    expect(w.snapZone).toBe('left');
    expect(w.isMaximized).toBe(false);
    expect(w.position).toEqual({ x: 0, y: 0 });
    expect(w.size.w).toBe(Math.floor(window.innerWidth / 2));
  });

  it("'top' snap delegates to maximize", () => {
    const store = useWindowStore.getState();
    store.openWindow('about', 'About');
    const id = useWindowStore.getState().windows[0].id;

    store.snapWindow(id, 'top');

    const w = useWindowStore.getState().windows[0];
    expect(w.isMaximized).toBe(true);
    expect(w.snapZone).toBeUndefined();
    expect(w.size).toEqual({
      w: window.innerWidth,
      h: window.innerHeight - TASKBAR_HEIGHT,
    });
  });
});
