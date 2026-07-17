import { usePrefsStore, type Locale } from '../store/prefsStore';
import { ko } from './locales/ko';
import { en } from './locales/en';
import { resolveJosa } from './josa';

/**
 * Minimal shell i18n — a typed JSON resource pipeline (ko = source, en
 * mirrors its shape) with `{{var}}` interpolation. No dependency; locale
 * lives in `prefsStore`, so `useTranslation()` re-renders on switch.
 *
 * Scope: the host shell and its local apps (chrome, boot, errors, Resume,
 * Inspector, About).
 */
const resources = { ko, en } as const;

/** Translation params. Values are stringified into `{{placeholders}}`. */
export type TransParams = Record<string, string | number>;

function lookup(locale: Locale, key: string): string | undefined {
  // Walk the dot-path through the nested resource object.
  const value = key.split('.').reduce<unknown>(
    (node, part) =>
      node && typeof node === 'object' ? (node as Record<string, unknown>)[part] : undefined,
    resources[locale],
  );
  return typeof value === 'string' ? value : undefined;
}

function interpolate(str: string, params?: TransParams): string {
  if (!params) return str;
  return str.replace(/\{\{(\w+)\}\}/g, (_, name: string) =>
    params[name] != null ? String(params[name]) : `{{${name}}}`,
  );
}

/**
 * Resolve a key for a given locale, falling back to Korean (the source)
 * and finally to the raw key (with a dev warning) so nothing renders blank.
 */
export function translate(locale: Locale, key: string, params?: TransParams): string {
  const str = lookup(locale, key) ?? lookup('ko', key);
  if (str == null) {
    if (import.meta.env.DEV) console.warn(`[i18n] missing key: ${key}`);
    return key;
  }
  // Fix hedged particles ('을(를)') once interpolated values are in place.
  // English strings contain no hedge patterns, so this is a no-op for en.
  return resolveJosa(interpolate(str, params));
}

export type TFunction = (key: string, params?: TransParams) => string;

/** Reactive translation hook — components re-render when the locale changes. */
export function useTranslation(): { t: TFunction; locale: Locale } {
  const locale = usePrefsStore((s) => s.locale);
  const t: TFunction = (key, params) => translate(locale, key, params);
  return { t, locale };
}

/**
 * Non-reactive translation for use outside React (or in class components).
 * Reads the current locale from the store at call time.
 */
export function translateNow(key: string, params?: TransParams): string {
  return translate(usePrefsStore.getState().locale, key, params);
}

/**
 * Translate an app title by its registry `componentType` (e.g. 'calculator'
 * → '계산기'). Falls back to the provided registry/manifest title when the
 * app has no translation entry (e.g. a future remote not yet localized).
 */
export function translateAppTitle(t: TFunction, componentType: string, fallback: string): string {
  const key = `app.${componentType}`;
  const translated = t(key);
  return translated === key ? fallback : translated;
}
