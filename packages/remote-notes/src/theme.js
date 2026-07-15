/**
 * Shared Theme Tokens (inlined for independent deployment)
 * 
 * This is a copy of @proto/shared/theme for Vercel deployment.
 * Keep in sync with the main theme file.
 */

export const colors = {
  background: {
    primary: '#1a1a2e',
    secondary: '#16213e',
    tertiary: '#0f3460',
    surface: '#1f1f3d',
  },
  foreground: {
    primary: '#ffffff',
    secondary: '#a0a0b0',
    tertiary: '#6b6b7b',
    inverse: '#1a1a2e',
  },
  accent: {
    primary: '#e94560',
    secondary: '#533483',
    hover: '#ff6b6b',
    muted: '#e9456033',
  },
  success: { DEFAULT: '#4ade80', light: '#86efac', dark: '#22c55e' },
  warning: { DEFAULT: '#fbbf24', light: '#fcd34d', dark: '#f59e0b' },
  error: { DEFAULT: '#f87171', light: '#fca5a5', dark: '#ef4444' },
  info: { DEFAULT: '#60a5fa', light: '#93c5fd', dark: '#3b82f6' },
  chrome: {
    titlebar: '#252542',
    border: '#3d3d5c',
    shadow: 'rgba(0, 0, 0, 0.5)',
  },
  trafficLight: {
    close: '#ff5f57',
    minimize: '#febc2e',
    maximize: '#28c840',
  },
};

export const spacing = {
  px: '1px', 0: '0', 0.5: '0.125rem', 1: '0.25rem', 1.5: '0.375rem',
  2: '0.5rem', 2.5: '0.625rem', 3: '0.75rem', 3.5: '0.875rem', 4: '1rem',
  5: '1.25rem', 6: '1.5rem', 7: '1.75rem', 8: '2rem', 9: '2.25rem',
  10: '2.5rem', 11: '2.75rem', 12: '3rem', 14: '3.5rem', 16: '4rem',
  20: '5rem', 24: '6rem', 28: '7rem', 32: '8rem',
};

export const borderRadius = {
  none: '0', sm: '0.25rem', DEFAULT: '0.5rem', md: '0.5rem',
  lg: '0.75rem', xl: '1rem', '2xl': '1.5rem', full: '9999px',
};

export const fontFamily = {
  sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'Arial', 'sans-serif'],
  mono: ['"JetBrains Mono"', '"Fira Code"', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
};

export const fontSize = {
  '3xs': ['0.625rem', { lineHeight: '0.875rem' }],
  '2xs': ['0.6875rem', { lineHeight: '0.875rem' }],
  xs: ['0.75rem', { lineHeight: '1rem' }],
  sm: ['0.875rem', { lineHeight: '1.25rem' }],
  base: ['1rem', { lineHeight: '1.5rem' }],
  lg: ['1.125rem', { lineHeight: '1.75rem' }],
  xl: ['1.25rem', { lineHeight: '1.75rem' }],
  '2xl': ['1.5rem', { lineHeight: '2rem' }],
};

export const boxShadow = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
  DEFAULT: '0 2px 4px 0 rgba(0, 0, 0, 0.4)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -2px rgba(0, 0, 0, 0.3)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -4px rgba(0, 0, 0, 0.3)',
  window: '0 8px 32px rgba(0, 0, 0, 0.5), 0 2px 8px rgba(0, 0, 0, 0.3)',
};

export const zIndex = {
  desktop: 0, window: 10, 'window-focused': 20,
  modal: 100, popover: 200, tooltip: 300, taskbar: 9999,
};

export const transition = {
  fast: '150ms ease-in-out',
  normal: '200ms ease-in-out',
  slow: '300ms ease-in-out',
};

export default { colors, spacing, borderRadius, fontFamily, fontSize, boxShadow, zIndex, transition };
