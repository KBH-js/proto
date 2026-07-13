import {
  forwardRef,
  useMemo,
  type AllHTMLAttributes,
  type CSSProperties,
  type ElementType,
} from 'react';
import { ensureGlassFilters } from './glassFilters';
import './glass.css';

/**
 * <LiquidGlass> — the reusable Liquid Glass (macOS Tahoe 26) surface.
 *
 * Lives in the shared layer (`@proto/shared/glass`) and is registered as a
 * Module Federation **singleton**, exactly like React: the host provides one
 * instance and every remote consumes it (falling back to its own bundled copy
 * when run standalone). One instance means one shared `<defs>` filter and one
 * set of CSS tokens across the whole federation.
 *
 * The refracting material is authored in glass.css (SVG displacement in
 * `backdrop-filter`, @supports-gated with a glassmorphism fallback). This file
 * owns the React surface, the variant presets, and the one-time global filter.
 */

export type LiquidGlassVariant = 'dock' | 'window' | 'menu' | 'card' | 'button';

export interface LiquidGlassProps extends Omit<AllHTMLAttributes<HTMLElement>, 'color' | 'size' | 'as'> {
  variant?: LiquidGlassVariant;
  /** Backdrop blur radius in px. Defaults per variant. */
  blur?: number;
  /** Backdrop saturation as a percentage number (e.g. 180). Defaults per variant. */
  saturate?: number;
  /** Override the translucent tint (any CSS colour). Defaults to the theme token. */
  tint?: string;
  /** Add edge RGB fringing (chromatic aberration). Defaults on for dock/window/menu. */
  chromaticAberration?: boolean;
  /** Corner radius (number → px). Defaults per variant. */
  radius?: number | string;
  /** Render inline (inline-flex) — for pill buttons / badges. */
  inline?: boolean;
  /** Element to render as. Defaults to 'div' (or 'button' when onClick is given). */
  as?: ElementType;
}

interface VariantPreset {
  blur: number;
  saturate: number;
  radius: number;
  chroma: boolean;
}

const VARIANT_PRESETS: Record<LiquidGlassVariant, VariantPreset> = {
  dock: { blur: 20, saturate: 190, radius: 24, chroma: true },
  window: { blur: 16, saturate: 165, radius: 16, chroma: true },
  menu: { blur: 22, saturate: 185, radius: 16, chroma: true },
  card: { blur: 12, saturate: 160, radius: 16, chroma: false },
  button: { blur: 8, saturate: 150, radius: 999, chroma: false },
};

/**
 * Standalone mountable filter host. Rendering this once (e.g. in the host App)
 * is optional — LiquidGlass self-installs the filters on mount — but it lets
 * the host guarantee the defs exist before the first glass surface paints.
 */
export function LiquidGlassFilters() {
  ensureGlassFilters();
  return null;
}

function toLen(v: number | string | undefined): string | undefined {
  if (v === undefined) return undefined;
  return typeof v === 'number' ? `${v}px` : v;
}

export const LiquidGlass = forwardRef<HTMLElement, LiquidGlassProps>(function LiquidGlass(
  {
    variant = 'card',
    blur,
    saturate,
    tint,
    chromaticAberration,
    radius,
    inline = false,
    as,
    className = '',
    style,
    children,
    onClick,
    ...rest
  },
  ref,
) {
  // Install the shared filters as early as possible (idempotent).
  ensureGlassFilters();

  const preset = VARIANT_PRESETS[variant] ?? VARIANT_PRESETS.card;
  const useChroma = chromaticAberration ?? preset.chroma;

  const Component: ElementType = as ?? (onClick ? 'button' : 'div');

  const mergedStyle = useMemo<CSSProperties>(() => {
    const vars: Record<string, string> = {
      '--lg-blur': `${blur ?? preset.blur}px`,
      '--lg-saturate': `${saturate ?? preset.saturate}%`,
      '--lg-radius': toLen(radius) ?? (variant === 'button' ? '9999px' : `${preset.radius}px`),
    };
    if (tint) vars['--lg-tint'] = tint;
    return { ...vars, ...style } as CSSProperties;
  }, [blur, saturate, radius, tint, preset, variant, style]);

  const classes = [
    'lg-surface',
    `lg-${variant}`,
    'lg-refract',
    useChroma ? 'lg-chroma' : '',
    inline ? 'inline-flex' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Component ref={ref} className={classes} style={mergedStyle} onClick={onClick} {...rest}>
      {children}
    </Component>
  );
});

export default LiquidGlass;
