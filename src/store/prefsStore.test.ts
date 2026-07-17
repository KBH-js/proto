import { describe, it, expect } from 'vitest';
import { detectLocale } from './prefsStore';

const withLanguage = (language: string, fn: () => void) => {
  const original = Object.getOwnPropertyDescriptor(Navigator.prototype, 'language');
  Object.defineProperty(navigator, 'language', { value: language, configurable: true });
  try {
    fn();
  } finally {
    delete (navigator as unknown as Record<string, unknown>).language;
    if (original) Object.defineProperty(Navigator.prototype, 'language', original);
  }
};

describe('detectLocale', () => {
  it('returns ko for Korean browser languages', () => {
    withLanguage('ko', () => expect(detectLocale()).toBe('ko'));
    withLanguage('ko-KR', () => expect(detectLocale()).toBe('ko'));
  });

  it('returns en for everything else', () => {
    withLanguage('en-US', () => expect(detectLocale()).toBe('en'));
    withLanguage('ja-JP', () => expect(detectLocale()).toBe('en'));
  });
});
