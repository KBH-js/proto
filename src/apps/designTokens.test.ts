import { describe, it, expect } from 'vitest';
import { colors } from '@proto/shared/theme';
import { buildTokenLayers, buildPrimitiveGroups } from './designTokens';

describe('buildTokenLayers', () => {
  it('exposes exactly the three layers in order', () => {
    const layers = buildTokenLayers();
    expect(Object.keys(layers)).toEqual(['primitive', 'semantic', 'component']);
  });

  it('derives primitives directly from the shared token source (no drift)', () => {
    const groups = buildPrimitiveGroups(colors);
    const bg = groups.find((g) => g.group === 'background');
    expect(bg).toBeDefined();
    expect(bg!.tokens.find((tok) => tok.name === 'background.primary')?.value).toBe(
      colors.background.primary,
    );
    // Every palette family becomes a primitive group.
    expect(groups.map((g) => g.group)).toEqual(Object.keys(colors));
  });

  it('semantic tokens reference a primitive and resolve to its value', () => {
    const action = buildTokenLayers().semantic.find((g) => g.group === 'action')!;
    const primary = action.tokens.find((tok) => tok.name === 'action.primary')!;
    expect(primary.ref).toBe('accent.primary');
    expect(primary.value).toBe(colors.accent.primary);
  });

  it('component tokens map to chrome / traffic-light primitives', () => {
    const component = buildTokenLayers().component;
    const tl = component.find((g) => g.group === 'trafficLight')!;
    expect(tl.tokens.map((tok) => tok.name)).toContain('trafficLight.close');
    expect(tl.tokens.find((tok) => tok.name === 'trafficLight.close')!.value).toBe(
      colors.trafficLight.close,
    );
  });
});
