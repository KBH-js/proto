export {};

/**
 * Host → remote federation bridge globals + events.
 *
 * The host seeds these globals and dispatches the events on every prefs change
 * (see src/federation/hostBridge.ts) so independently-built remotes can read
 * the active locale/theme without importing host modules.
 */
declare global {
  interface Window {
    __PROTO_LOCALE__?: 'ko' | 'en';
    __PROTO_THEME__?: 'dark' | 'light';
  }

  interface WindowEventMap {
    'host:locale-changed': CustomEvent<{ locale: 'ko' | 'en' }>;
    'host:theme-changed': CustomEvent<{ theme: 'dark' | 'light' }>;
  }
}
