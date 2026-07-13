import { useEffect } from 'react';
import { usePrefsStore } from '../store/prefsStore';
import { useWindowStore } from '../store/windowStore';
import { useTourStore } from '../store/tourStore';

/** Shell-level keyboard actions, resolved from an `Alt`+key chord. */
export type ShortcutAction = 'about' | 'inspector' | 'theme' | 'locale' | 'tour';

/**
 * Pure event → action resolver (exported for unit tests).
 *
 * All shortcuts are `Alt`+<key> chords, and are suppressed while a form
 * field is focused so remote app inputs (calculator, notes) keep their keys.
 * `e.code` (physical key) is used so the mapping is layout-independent.
 */
export function resolveShortcut(e: KeyboardEvent): ShortcutAction | null {
  const target = e.target as (HTMLElement | null);
  if (target) {
    const tag = target.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable) return null;
  }
  if (!e.altKey || e.ctrlKey || e.metaKey) return null;

  switch (e.code) {
    case 'KeyA':
      return 'about';
    case 'KeyI':
      return 'inspector';
    case 'KeyT':
      return 'theme';
    case 'KeyL':
      return 'locale';
    case 'Slash':
      return 'tour';
    default:
      return null;
  }
}

/**
 * Global keyboard shortcuts for the shell. Reads stores via `getState()` in
 * the handler (no stale closures, no re-subscription), so the listener is
 * attached once for the app's lifetime.
 */
export function useShortcuts(): void {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const action = resolveShortcut(e);
      if (!action) return;
      e.preventDefault();

      switch (action) {
        case 'about':
          useWindowStore.getState().openWindow('about', 'About');
          break;
        case 'inspector':
          useWindowStore.getState().openWindow('inspector', 'Inspector');
          break;
        case 'theme':
          usePrefsStore.getState().toggleTheme();
          break;
        case 'locale':
          usePrefsStore.getState().toggleLocale();
          break;
        case 'tour':
          useTourStore.getState().start();
          break;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);
}
