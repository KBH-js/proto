import { colors } from '@proto/shared/theme';

/**
 * 3-layer token model builder (pure, so it can be unit-tested).
 *
 *   primitive → semantic → component
 *
 * - Primitive: the raw palette values, derived directly from the single token
 *   source (@proto/shared/theme) so the gallery can never drift from it.
 * - Semantic: role-based aliases (surface / text / action / status).
 * - Component: the tokens specific UI parts consume (window chrome, buttons…).
 *
 * Semantic/component entries carry a `ref` back to the primitive path they
 * resolve to — that indirection is the whole point of a token pipeline.
 */

export interface TokenSwatch {
  name: string;
  value: string;
  /** Primitive path this token resolves to (semantic/component layers only). */
  ref?: string;
}

export interface TokenGroup {
  group: string;
  tokens: TokenSwatch[];
}

export interface TokenLayers {
  primitive: TokenGroup[];
  semantic: TokenGroup[];
  component: TokenGroup[];
}

type ColorTokens = typeof colors;

/** Flatten every palette family into primitive swatch groups. */
export function buildPrimitiveGroups(source: ColorTokens): TokenGroup[] {
  return (Object.entries(source) as [string, Record<string, string>][]).map(([family, scale]) => ({
    group: family,
    tokens: Object.entries(scale).map(([key, value]) => ({
      name: `${family}.${key}`,
      value: String(value),
    })),
  }));
}

function semanticGroups(c: ColorTokens): TokenGroup[] {
  return [
    {
      group: 'surface',
      tokens: [
        { name: 'surface.base', value: c.background.primary, ref: 'background.primary' },
        { name: 'surface.raised', value: c.background.secondary, ref: 'background.secondary' },
        { name: 'surface.overlay', value: c.background.surface, ref: 'background.surface' },
      ],
    },
    {
      group: 'text',
      tokens: [
        { name: 'text.primary', value: c.foreground.primary, ref: 'foreground.primary' },
        { name: 'text.secondary', value: c.foreground.secondary, ref: 'foreground.secondary' },
        { name: 'text.disabled', value: c.foreground.tertiary, ref: 'foreground.tertiary' },
      ],
    },
    {
      group: 'action',
      tokens: [
        { name: 'action.primary', value: c.accent.primary, ref: 'accent.primary' },
        { name: 'action.hover', value: c.accent.hover, ref: 'accent.hover' },
        { name: 'action.secondary', value: c.accent.secondary, ref: 'accent.secondary' },
      ],
    },
    {
      group: 'status',
      tokens: [
        { name: 'status.success', value: c.success.DEFAULT, ref: 'success.DEFAULT' },
        { name: 'status.warning', value: c.warning.DEFAULT, ref: 'warning.DEFAULT' },
        { name: 'status.error', value: c.error.DEFAULT, ref: 'error.DEFAULT' },
        { name: 'status.info', value: c.info.DEFAULT, ref: 'info.DEFAULT' },
      ],
    },
  ];
}

function componentGroups(c: ColorTokens): TokenGroup[] {
  return [
    {
      group: 'window',
      tokens: [
        { name: 'window.titlebar', value: c.chrome.titlebar, ref: 'chrome.titlebar' },
        { name: 'window.border', value: c.chrome.border, ref: 'chrome.border' },
      ],
    },
    {
      group: 'trafficLight',
      tokens: [
        { name: 'trafficLight.close', value: c.trafficLight.close, ref: 'trafficLight.close' },
        { name: 'trafficLight.minimize', value: c.trafficLight.minimize, ref: 'trafficLight.minimize' },
        { name: 'trafficLight.maximize', value: c.trafficLight.maximize, ref: 'trafficLight.maximize' },
      ],
    },
    {
      group: 'button',
      tokens: [
        { name: 'button.bg', value: c.accent.primary, ref: 'accent.primary' },
        { name: 'button.text', value: c.foreground.primary, ref: 'foreground.primary' },
      ],
    },
  ];
}

/** Assemble the full 3-layer model from the shared token source. */
export function buildTokenLayers(source: ColorTokens = colors): TokenLayers {
  return {
    primitive: buildPrimitiveGroups(source),
    semantic: semanticGroups(source),
    component: componentGroups(source),
  };
}
