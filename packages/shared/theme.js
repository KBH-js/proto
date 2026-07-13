// Design tokens shared by the host and remote micro-frontends,
// consumed from each package's tailwind.config.js.

export const colors = {
  // Background colors
  background: {
    primary: '#1a1a2e',      // Main desktop/window background
    secondary: '#16213e',    // Elevated surfaces (cards, dialogs)
    tertiary: '#0f3460',     // Hover states, active elements
    surface: '#1f1f3d',      // Window content area
  },
  
  // Foreground/text colors
  foreground: {
    primary: '#ffffff',      // Primary text
    secondary: '#a0a0b0',    // Secondary/muted text
    tertiary: '#6b6b7b',     // Disabled/placeholder text
    inverse: '#1a1a2e',      // Text on light backgrounds
  },
  
  // Accent colors
  accent: {
    primary: '#e94560',      // Primary actions, focus rings
    secondary: '#533483',    // Secondary actions
    hover: '#ff6b6b',        // Hover state for primary accent
    muted: '#e9456033',      // Muted accent (for backgrounds)
  },
  
  // Semantic colors
  success: {
    DEFAULT: '#4ade80',
    light: '#86efac',
    dark: '#22c55e',
  },
  warning: {
    DEFAULT: '#fbbf24',
    light: '#fcd34d',
    dark: '#f59e0b',
  },
  error: {
    DEFAULT: '#f87171',
    light: '#fca5a5',
    dark: '#ef4444',
  },
  info: {
    DEFAULT: '#60a5fa',
    light: '#93c5fd',
    dark: '#3b82f6',
  },
  
  // Window chrome colors
  chrome: {
    titlebar: '#252542',     // Window title bar
    border: '#3d3d5c',       // Window borders
    shadow: 'rgba(0, 0, 0, 0.5)', // Window shadows
  },
  
  // Traffic light buttons (macOS style)
  trafficLight: {
    close: '#ff5f57',
    minimize: '#febc2e',
    maximize: '#28c840',
  },
};

// 4px grid
export const spacing = {
  px: '1px',
  0: '0',
  0.5: '0.125rem',   // 2px
  1: '0.25rem',      // 4px
  1.5: '0.375rem',   // 6px
  2: '0.5rem',       // 8px
  2.5: '0.625rem',   // 10px
  3: '0.75rem',      // 12px
  3.5: '0.875rem',   // 14px
  4: '1rem',         // 16px
  5: '1.25rem',      // 20px
  6: '1.5rem',       // 24px
  7: '1.75rem',      // 28px
  8: '2rem',         // 32px
  9: '2.25rem',      // 36px
  10: '2.5rem',      // 40px
  11: '2.75rem',     // 44px
  12: '3rem',        // 48px
  14: '3.5rem',      // 56px
  16: '4rem',        // 64px
  20: '5rem',        // 80px
  24: '6rem',        // 96px
  28: '7rem',        // 112px
  32: '8rem',        // 128px
};

export const borderRadius = {
  none: '0',
  sm: '0.25rem',     // 4px - subtle rounding
  DEFAULT: '0.5rem', // 8px - standard rounding
  md: '0.5rem',      // 8px
  lg: '0.75rem',     // 12px - larger components
  xl: '1rem',        // 16px - cards, dialogs
  '2xl': '1.5rem',   // 24px - large panels
  full: '9999px',    // Circular
};

export const fontFamily = {
  sans: [
    'Inter',
    'system-ui',
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    'Roboto',
    '"Helvetica Neue"',
    'Arial',
    'sans-serif',
  ],
  mono: [
    '"JetBrains Mono"',
    '"Fira Code"',
    'Menlo',
    'Monaco',
    'Consolas',
    '"Liberation Mono"',
    '"Courier New"',
    'monospace',
  ],
};

export const fontSize = {
  xs: ['0.75rem', { lineHeight: '1rem' }],       // 12px
  sm: ['0.875rem', { lineHeight: '1.25rem' }],   // 14px
  base: ['1rem', { lineHeight: '1.5rem' }],      // 16px
  lg: ['1.125rem', { lineHeight: '1.75rem' }],   // 18px
  xl: ['1.25rem', { lineHeight: '1.75rem' }],    // 20px
  '2xl': ['1.5rem', { lineHeight: '2rem' }],     // 24px
  '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
  '4xl': ['2.25rem', { lineHeight: '2.5rem' }],  // 36px
};

export const boxShadow = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
  DEFAULT: '0 2px 4px 0 rgba(0, 0, 0, 0.4)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -2px rgba(0, 0, 0, 0.3)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -4px rgba(0, 0, 0, 0.3)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.3)',
  window: '0 8px 32px rgba(0, 0, 0, 0.5), 0 2px 8px rgba(0, 0, 0, 0.3)',
  'window-focused': '0 12px 48px rgba(0, 0, 0, 0.6), 0 4px 12px rgba(0, 0, 0, 0.4)',
};

export const zIndex = {
  desktop: 0,
  window: 10,
  'window-focused': 20,
  modal: 100,
  popover: 200,
  tooltip: 300,
  taskbar: 9999,
};

// Desktop wallpaper gradients — the single sanctioned home for these raw color
// stops. Kept here (a token source, not linted) so product code stays free of
// raw hex/rgba and consumes them as `wallpaper.dark` / `wallpaper.light`.
// Desktop wallpapers are intentionally colourful multi-hue meshes: Liquid Glass
// looks flat over flat backgrounds, so the dock/windows need vivid colour behind
// them to refract and tint. Two variants tuned per shell theme.
export const wallpaper = {
  // Dark shell — a saturated aurora mesh (violet → blue → teal → magenta) over
  // deep navy, so frosted surfaces pick up colour without washing out.
  dark: `
  radial-gradient(80% 70% at 12% 8%, rgba(139, 92, 246, 0.55) 0%, transparent 60%),
  radial-gradient(75% 70% at 88% 14%, rgba(56, 189, 248, 0.50) 0%, transparent 58%),
  radial-gradient(90% 80% at 78% 92%, rgba(45, 212, 191, 0.42) 0%, transparent 60%),
  radial-gradient(80% 75% at 20% 88%, rgba(236, 72, 153, 0.38) 0%, transparent 60%),
  radial-gradient(70% 70% at 50% 50%, rgba(59, 130, 246, 0.30) 0%, transparent 70%),
  linear-gradient(150deg, #0b1030 0%, #10204d 42%, #0e2f5c 70%, #131233 100%)
`,
  // Light shell — a bright pastel mesh (sky → mint → peach → lilac); mid-toned
  // enough that white icon labels stay legible and dark glass text keeps contrast.
  light: `
  radial-gradient(80% 70% at 10% 8%, rgba(129, 140, 248, 0.55) 0%, transparent 60%),
  radial-gradient(75% 70% at 90% 12%, rgba(125, 211, 252, 0.60) 0%, transparent 58%),
  radial-gradient(90% 80% at 82% 90%, rgba(94, 234, 212, 0.52) 0%, transparent 60%),
  radial-gradient(80% 75% at 16% 90%, rgba(251, 207, 232, 0.55) 0%, transparent 60%),
  radial-gradient(70% 70% at 50% 45%, rgba(147, 197, 253, 0.40) 0%, transparent 70%),
  linear-gradient(150deg, #cfe3ff 0%, #a9c8ff 40%, #93c5fd 68%, #bcd4ff 100%)
`,
};

export const transition = {
  fast: '150ms ease-in-out',
  normal: '200ms ease-in-out',
  slow: '300ms ease-in-out',
};

export default {
  colors,
  spacing,
  borderRadius,
  fontFamily,
  fontSize,
  boxShadow,
  zIndex,
  transition,
  wallpaper,
};
