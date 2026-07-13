// Type declarations for the JS token source (theme.js). Lets the host
// consume `@proto/shared/theme` type-safely under `strict`.

export interface ColorScale {
  DEFAULT: string;
  light: string;
  dark: string;
}

export declare const colors: {
  background: { primary: string; secondary: string; tertiary: string; surface: string };
  foreground: { primary: string; secondary: string; tertiary: string; inverse: string };
  accent: { primary: string; secondary: string; hover: string; muted: string };
  success: ColorScale;
  warning: ColorScale;
  error: ColorScale;
  info: ColorScale;
  chrome: { titlebar: string; border: string; shadow: string };
  trafficLight: { close: string; minimize: string; maximize: string };
};

export declare const spacing: Record<string, string>;
export declare const borderRadius: Record<string, string>;
export declare const fontFamily: Record<string, string[]>;
export declare const fontSize: Record<string, [string, { lineHeight: string }]>;
export declare const boxShadow: Record<string, string>;
export declare const zIndex: Record<string, number>;
export declare const transition: Record<string, string>;
export declare const wallpaper: { dark: string; light: string };

declare const _default: {
  colors: typeof colors;
  spacing: typeof spacing;
  borderRadius: typeof borderRadius;
  fontFamily: typeof fontFamily;
  fontSize: typeof fontSize;
  boxShadow: typeof boxShadow;
  zIndex: typeof zIndex;
  transition: typeof transition;
  wallpaper: typeof wallpaper;
};
export default _default;
