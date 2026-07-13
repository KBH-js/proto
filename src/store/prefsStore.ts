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
 * Korean + dark (the portfolio's primary presentation).
 */
export type Locale = 'ko' | 'en';
export type Theme = 'dark' | 'light';

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
      locale: 'ko',
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
