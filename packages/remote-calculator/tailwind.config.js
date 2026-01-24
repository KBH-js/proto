import { colors, spacing, borderRadius, fontFamily, fontSize, boxShadow } from '@proto/shared/theme';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors,
      spacing,
      borderRadius,
      fontFamily,
      fontSize,
      boxShadow,
    },
  },
  plugins: [],
};
