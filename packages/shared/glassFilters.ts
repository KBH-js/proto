/*
 * Shared Liquid Glass SVG filters — the one-time <defs> injected into the
 * document and referenced by `backdrop-filter: url(#lg-refract)` in glass.css.
 *
 * Kept in its own module (no component exports) so LiquidGlass.tsx stays a
 * components-only file for fast-refresh, and so a standalone remote can install
 * the filters without pulling in React.
 */

const FILTER_DEFS_ID = 'lg-filter-defs';

/**
 * The two shared filters. `#lg-refract` warps the backdrop with a soft
 * fractal-noise displacement map; the `-chroma` variant additionally splits
 * R/B channels for edge fringing (chromatic aberration). Static (no <animate>)
 * so they cost nothing to keep mounted and respect reduced-motion.
 *
 * `x/y/width/height` give the filter region slack so displaced edge pixels
 * aren't clipped. `color-interpolation-filters=sRGB` keeps the tint true.
 */
const FILTER_MARKUP = `
<filter id="lg-refract" x="-25%" y="-25%" width="150%" height="150%" color-interpolation-filters="sRGB">
  <feTurbulence type="fractalNoise" baseFrequency="0.009 0.013" numOctaves="2" seed="7" result="noise"/>
  <feGaussianBlur in="noise" stdDeviation="1.4" result="softNoise"/>
  <feDisplacementMap in="SourceGraphic" in2="softNoise" scale="40" xChannelSelector="R" yChannelSelector="G"/>
</filter>
<filter id="lg-refract-chroma" x="-25%" y="-25%" width="150%" height="150%" color-interpolation-filters="sRGB">
  <feTurbulence type="fractalNoise" baseFrequency="0.009 0.013" numOctaves="2" seed="7" result="noise"/>
  <feGaussianBlur in="noise" stdDeviation="1.4" result="softNoise"/>
  <feDisplacementMap in="SourceGraphic" in2="softNoise" scale="46" xChannelSelector="R" yChannelSelector="G" result="disp"/>
  <feColorMatrix in="disp" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="rC"/>
  <feOffset in="rC" dx="1.1" dy="0" result="rOff"/>
  <feColorMatrix in="disp" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="gC"/>
  <feColorMatrix in="disp" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="bC"/>
  <feOffset in="bC" dx="-1.1" dy="0" result="bOff"/>
  <feBlend in="rOff" in2="gC" mode="screen" result="rg"/>
  <feBlend in="rg" in2="bOff" mode="screen"/>
</filter>
`;

/**
 * Ensure the shared filter <defs> exist in the document — idempotent, so it is
 * safe to call from every LiquidGlass mount (and from standalone remotes). The
 * id guard makes every call after the first a no-op.
 */
export function ensureGlassFilters(): void {
  if (typeof document === 'undefined') return;
  if (document.getElementById(FILTER_DEFS_ID)) return;

  const mount = () => {
    if (document.getElementById(FILTER_DEFS_ID)) return;
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('id', FILTER_DEFS_ID);
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('width', '0');
    svg.setAttribute('height', '0');
    svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;pointer-events:none';
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    defs.innerHTML = FILTER_MARKUP;
    svg.appendChild(defs);
    (document.body ?? document.documentElement).appendChild(svg);
  };

  if (document.body) mount();
  else document.addEventListener('DOMContentLoaded', mount, { once: true });
}
