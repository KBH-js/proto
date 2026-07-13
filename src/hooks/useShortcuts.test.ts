import { describe, it, expect } from 'vitest';
import { resolveShortcut } from './useShortcuts';

/** Build a minimal KeyboardEvent-like object for the pure resolver. */
function ev(
  code: string,
  opts: Partial<Pick<KeyboardEvent, 'altKey' | 'ctrlKey' | 'metaKey'>> = {},
  target?: Partial<HTMLElement>,
): KeyboardEvent {
  return {
    code,
    altKey: true,
    ctrlKey: false,
    metaKey: false,
    target,
    ...opts,
  } as unknown as KeyboardEvent;
}

describe('resolveShortcut', () => {
  it('maps Alt+<key> chords to shell actions', () => {
    expect(resolveShortcut(ev('KeyA'))).toBe('about');
    expect(resolveShortcut(ev('KeyI'))).toBe('inspector');
    expect(resolveShortcut(ev('KeyT'))).toBe('theme');
    expect(resolveShortcut(ev('KeyL'))).toBe('locale');
    expect(resolveShortcut(ev('Slash'))).toBe('tour');
  });

  it('requires Alt and rejects ctrl/meta combos', () => {
    expect(resolveShortcut(ev('KeyA', { altKey: false }))).toBeNull();
    expect(resolveShortcut(ev('KeyA', { ctrlKey: true }))).toBeNull();
    expect(resolveShortcut(ev('KeyA', { metaKey: true }))).toBeNull();
  });

  it('ignores unmapped keys', () => {
    expect(resolveShortcut(ev('KeyZ'))).toBeNull();
    expect(resolveShortcut(ev('Digit1'))).toBeNull();
  });

  it('is suppressed while a form field is focused', () => {
    expect(resolveShortcut(ev('KeyA', {}, { tagName: 'INPUT' }))).toBeNull();
    expect(resolveShortcut(ev('KeyI', {}, { tagName: 'TEXTAREA' }))).toBeNull();
    expect(
      resolveShortcut(ev('KeyT', {}, { tagName: 'DIV', isContentEditable: true } as Partial<HTMLElement>)),
    ).toBeNull();
  });
});
