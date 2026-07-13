// Non-color scales come from the shared token copy; colors are resolved from
// CSS variables (see src/index.css) so they flip with the host `.dark` ancestor.
import { spacing, borderRadius, fontFamily, fontSize, boxShadow } from './src/theme.js';

/** @type {import('tailwindcss').Config} */
export default {
  // The host shell toggles a `dark` class on its root, an ancestor of this
  // remote's DOM. `darkMode:'class'` + CSS-variable tokens = free theme reaction.
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Semantic tokens, scoped to `.remote-network` in src/index.css.
        // `<alpha-value>` lets `/opacity` modifiers (e.g. bg-ok/15) resolve.
        surface: 'rgb(var(--net-surface) / <alpha-value>)',
        panel: 'rgb(var(--net-panel) / <alpha-value>)',
        sunken: 'rgb(var(--net-sunken) / <alpha-value>)',
        line: 'rgb(var(--net-line) / <alpha-value>)',
        body: 'rgb(var(--net-body) / <alpha-value>)',
        muted: 'rgb(var(--net-muted) / <alpha-value>)',
        faint: 'rgb(var(--net-faint) / <alpha-value>)',
        accent: 'rgb(var(--net-accent) / <alpha-value>)',
        'accent-soft': 'rgb(var(--net-accent-soft) / <alpha-value>)',
        ok: 'rgb(var(--net-ok) / <alpha-value>)',
        warn: 'rgb(var(--net-warn) / <alpha-value>)',
        danger: 'rgb(var(--net-danger) / <alpha-value>)',
        info: 'rgb(var(--net-info) / <alpha-value>)',
      },
      spacing,
      borderRadius,
      fontFamily,
      fontSize,
      boxShadow,
    },
  },
  plugins: [],
};
