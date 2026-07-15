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
        // Semantic tokens, scoped to `.remote-compute` in src/index.css.
        // `<alpha-value>` lets `/opacity` modifiers (e.g. bg-ok/15) resolve.
        surface: 'rgb(var(--cmp-surface) / <alpha-value>)',
        panel: 'rgb(var(--cmp-panel) / <alpha-value>)',
        sunken: 'rgb(var(--cmp-sunken) / <alpha-value>)',
        line: 'rgb(var(--cmp-line) / <alpha-value>)',
        body: 'rgb(var(--cmp-body) / <alpha-value>)',
        muted: 'rgb(var(--cmp-muted) / <alpha-value>)',
        faint: 'rgb(var(--cmp-faint) / <alpha-value>)',
        accent: 'rgb(var(--cmp-accent) / <alpha-value>)',
        'accent-soft': 'rgb(var(--cmp-accent-soft) / <alpha-value>)',
        ok: 'rgb(var(--cmp-ok) / <alpha-value>)',
        warn: 'rgb(var(--cmp-warn) / <alpha-value>)',
        danger: 'rgb(var(--cmp-danger) / <alpha-value>)',
        info: 'rgb(var(--cmp-info) / <alpha-value>)',
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
