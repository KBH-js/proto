/**
 * Shared Theme Tokens (inlined for independent deployment)
 *
 * A copy of @proto/shared/theme for Vercel deployment. Only the non-color
 * scales (spacing/radius/font/shadow) are consumed by tailwind.config.js;
 * this remote resolves its colors from CSS variables (src/index.css).
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
};

export default { colors, spacing, borderRadius, fontFamily, fontSize, boxShadow };
