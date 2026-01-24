// Use local theme copy for independent deployment (instead of @proto/shared/theme)
import { colors, spacing, borderRadius, fontFamily, fontSize, boxShadow } from './src/theme.js';

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
