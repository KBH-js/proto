import { useLayoutEffect, useRef, type RefObject } from 'react';

/**
 * ARIA-menu keyboard behavior for a popover that is mounted while open:
 * focuses the first `[role="menuitem"]` on open, roves focus with
 * ArrowUp/Down (wrapping) + Home/End, and closes on Escape or Tab.
 *
 * On unmount, focus returns to the element focused before the menu opened —
 * but only when focus is still inside the menu. If the menu closed because
 * the user clicked elsewhere, that click's own focus target must win.
 */
export function useMenuFocus(menuRef: RefObject<HTMLElement | null>, onClose: () => void) {
  // Parents pass inline closures; keeping the latest one in a ref lets the
  // effect run once per mount instead of re-focusing the first item on every
  // parent re-render.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // Layout effect: the unmount cleanup must run BEFORE React detaches the
  // menu's DOM — a passive effect cleanup runs after removal, when focus has
  // already reset to <body> and the "was focus inside the menu?" check fails.
  useLayoutEffect(() => {
    const menu = menuRef.current;
    if (!menu) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const getItems = () =>
      Array.from(menu.querySelectorAll<HTMLElement>('[role="menuitem"]')).filter(
        (el) => !el.hasAttribute('disabled'),
      );

    getItems()[0]?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      const items = getItems();
      if (items.length === 0) return;
      const currentIndex = items.indexOf(document.activeElement as HTMLElement);

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          items[(currentIndex + 1) % items.length].focus();
          break;
        case 'ArrowUp':
          e.preventDefault();
          items[(currentIndex - 1 + items.length) % items.length].focus();
          break;
        case 'Home':
          e.preventDefault();
          items[0].focus();
          break;
        case 'End':
          e.preventDefault();
          items[items.length - 1].focus();
          break;
        case 'Escape':
          e.preventDefault();
          onCloseRef.current();
          break;
        case 'Tab':
          onCloseRef.current();
          break;
      }
    };

    menu.addEventListener('keydown', handleKeyDown);
    return () => {
      menu.removeEventListener('keydown', handleKeyDown);
      if (menu.contains(document.activeElement) && previouslyFocused?.isConnected) {
        previouslyFocused.focus();
      }
    };
  }, [menuRef]);
}
