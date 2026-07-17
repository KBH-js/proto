// Type declarations for the local JS token source (theme.js) — mirrors the
// packages/shared/theme.d.ts pattern so .tsx code can consume tokens under
// `strict`. tailwind.config.js keeps importing the .js directly.

export declare const colors: {
  background: { primary: string; secondary: string; tertiary: string; surface: string };
  foreground: { primary: string; secondary: string; tertiary: string; inverse: string };
  accent: { primary: string; secondary: string; hover: string; muted: string };
  success: { DEFAULT: string; light: string; dark: string };
  warning: { DEFAULT: string; light: string; dark: string };
  error: { DEFAULT: string; light: string; dark: string };
  info: { DEFAULT: string; light: string; dark: string };
  chrome: { titlebar: string; border: string; shadow: string };
  trafficLight: { close: string; minimize: string; maximize: string };
};

export declare const spacing: Record<string, string>;
export declare const borderRadius: Record<string, string>;
export declare const fontFamily: Record<string, string[]>;
export declare const fontSize: Record<string, [string, { lineHeight: string }]>;
export declare const boxShadow: Record<string, string>;
export declare const zIndex: Record<string, number>;

/** Calculator-local Liquid Glass tints for the <LiquidGlass tint> prop. */
export declare const glassTint: {
  display: string;
  key: string;
  operation: string;
  accent: string;
  clear: string;
};
