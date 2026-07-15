import {
  cloneElement,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactElement,
  type SyntheticEvent,
} from 'react';
import { createPortal } from 'react-dom';
import { usePrefsStore } from '../../store/prefsStore';
import { isTouchDevice } from '../../utils/device';

interface TooltipProps {
  label: string;
  /** Which side of the trigger the bubble appears on. */
  side?: 'top' | 'bottom';
  /** A single focusable/hoverable element (button, a, span…). */
  children: ReactElement<Record<string, unknown>>;
}

const HOVER_DELAY_MS = 400;
const GAP = 8;
const EDGE_MARGIN = 8;

/**
 * Glass-themed replacement for native `title` tooltips: shows on hover
 * (after a short delay) and immediately on keyboard focus — which native
 * titles never do — and matches the shell theme instead of the OS chrome.
 *
 * The bubble is aria-hidden and purely visual; the trigger keeps its own
 * accessible name (text content or aria-label). On touch devices there is
 * no hover, so the child renders untouched.
 */
export function Tooltip({ label, side = 'top', children }: TooltipProps) {
  const theme = usePrefsStore((s) => s.theme);
  const [anchor, setAnchor] = useState<DOMRect | null>(null);
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number | null>(null);

  const cancelPending = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const show = (target: HTMLElement, delay: number) => {
    cancelPending();
    if (delay === 0) {
      setAnchor(target.getBoundingClientRect());
      return;
    }
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null;
      // The trigger may have moved (dock scroll) between schedule and fire.
      if (target.isConnected) setAnchor(target.getBoundingClientRect());
    }, delay);
  };

  const hide = useCallback(() => {
    cancelPending();
    setAnchor(null);
    setPos(null);
  }, [cancelPending]);

  // Render the bubble off-screen first, then clamp it into the viewport once
  // its real width is measurable.
  useLayoutEffect(() => {
    if (!anchor || !bubbleRef.current) return;
    const bubble = bubbleRef.current.getBoundingClientRect();
    const left = Math.min(
      Math.max(anchor.left + anchor.width / 2 - bubble.width / 2, EDGE_MARGIN),
      Math.max(EDGE_MARGIN, window.innerWidth - bubble.width - EDGE_MARGIN),
    );
    const top = side === 'top' ? anchor.top - bubble.height - GAP : anchor.bottom + GAP;
    setPos({ left, top });
  }, [anchor, side]);

  useEffect(() => {
    if (!anchor) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') hide();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [anchor, hide]);

  useEffect(() => cancelPending, [cancelPending]);

  if (isTouchDevice()) return children;

  const childProps = children.props;
  const chain =
    (name: string, run: (e: SyntheticEvent<HTMLElement>) => void) =>
    (e: SyntheticEvent<HTMLElement>) => {
      (childProps[name] as ((e: SyntheticEvent) => void) | undefined)?.(e);
      run(e);
    };

  return (
    <>
      {cloneElement(children, {
        onMouseEnter: chain('onMouseEnter', (e) => show(e.currentTarget, HOVER_DELAY_MS)),
        onMouseLeave: chain('onMouseLeave', hide),
        onFocus: chain('onFocus', (e) => show(e.currentTarget, 0)),
        onBlur: chain('onBlur', hide),
      })}
      {anchor &&
        createPortal(
          // Portals escape the shell's `.dark` root — re-scope the theme.
          <div className={theme === 'dark' ? 'dark' : ''}>
            <div
              ref={bubbleRef}
              aria-hidden="true"
              className="fixed z-[10002] pointer-events-none px-2 py-1 rounded-md text-xs whitespace-nowrap glass-chrome lg-text text-gray-800 dark:text-gray-100 border border-white/50 dark:border-white/10 shadow-lg"
              style={pos ? { left: pos.left, top: pos.top } : { left: -9999, top: 0 }}
            >
              {label}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
