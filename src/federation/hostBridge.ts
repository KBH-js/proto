import { usePrefsStore, type Locale, type Theme } from '../store/prefsStore';

/**
 * Host → remote preferences bridge.
 *
 * Remotes are independent builds and cannot import the host's i18n/theme.
 * This bridge exposes the shell's `locale`/`theme` to them via the documented
 * convention (REMOTES.md): a seeded global for the initial synchronous read,
 * plus a `host:*` CustomEvent on every change so remotes re-render in sync.
 *
 * Theme rides the shell's `.dark` ancestor class for free, so the event is
 * emitted mainly for remotes that prefer to drive theming in JS. Locale has no
 * DOM signal, so the event is the primary channel there.
 */

let started = false;

function emitLocale(locale: Locale): void {
  window.__PROTO_LOCALE__ = locale;
  window.dispatchEvent(new CustomEvent('host:locale-changed', { detail: { locale } }));
}

function emitTheme(theme: Theme): void {
  window.__PROTO_THEME__ = theme;
  window.dispatchEvent(new CustomEvent('host:theme-changed', { detail: { theme } }));
}

/** Wire the prefs store to the bridge. Idempotent — safe under StrictMode. */
export function initHostBridge(): void {
  if (started) return;
  started = true;

  // Seed globals so a remote mounting before the first toggle reads the truth.
  const { locale, theme } = usePrefsStore.getState();
  window.__PROTO_LOCALE__ = locale;
  window.__PROTO_THEME__ = theme;

  usePrefsStore.subscribe((state, prev) => {
    if (state.locale !== prev.locale) emitLocale(state.locale);
    if (state.theme !== prev.theme) emitTheme(state.theme);
  });
}
