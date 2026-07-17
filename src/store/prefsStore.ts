import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/**
 * User shell preferences — locale + theme.
 *
 * This is the single source of truth for the two shell-wide toggles and the
 * contract other tiers (domain apps, About rewrite) build against:
 *   - i18n reads `locale` via `useTranslation()` (src/i18n)
 *   - the dark/light shell reads `theme` (WindowManagerLayout toggles a
 *     `dark` class on the shell root; Tailwind runs in darkMode:'class')
 *
 * Persisted to localStorage so the choice survives reloads. Defaults:
 * browser-language locale (first visit only — persisted picks win) + dark
 * (the portfolio's primary presentation).
 */
export type Locale = 'ko' | 'en';
export type Theme = 'dark' | 'light';

/**
 * First-visit locale: Korean browsers get ko, everyone else en. Only feeds
 * the initial state — zustand's persist merge overwrites it whenever a
 * stored preference exists, so an explicit choice always survives reloads.
 */
export function detectLocale(): Locale {
  return typeof navigator !== 'undefined' && navigator.language?.toLowerCase().startsWith('ko')
    ? 'ko'
    : 'en';
}

interface PrefsState {
  locale: Locale;
  theme: Theme;
  setLocale: (locale: Locale) => void;
  setTheme: (theme: Theme) => void;
  toggleLocale: () => void;
  toggleTheme: () => void;
}

export const usePrefsStore = create<PrefsState>()(
  persist(
    (set) => ({
      locale: detectLocale(),
      theme: 'dark',
      setLocale: (locale) => set({ locale }),
      setTheme: (theme) => set({ theme }),
      toggleLocale: () => set((s) => ({ locale: s.locale === 'ko' ? 'en' : 'ko' })),
      toggleTheme: () => set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
    }),
    {
      name: 'proto-desktop:prefs',
      version: 1,
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
