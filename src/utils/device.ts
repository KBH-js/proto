/** Coarse pointer = touch-first device (no hover) */
export const isTouchDevice = (): boolean =>
  window.matchMedia('(pointer: coarse)').matches;

/** Below this width, windows open maximized instead of floating */
export const SMALL_SCREEN_BREAKPOINT = 768;

export const isSmallScreen = (): boolean =>
  window.innerWidth < SMALL_SCREEN_BREAKPOINT;
