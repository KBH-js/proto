import { useEffect, useId, useRef, useState } from 'react';
import { useTourStore } from '../../store/tourStore';
import { usePrefsStore } from '../../store/prefsStore';
import { useTranslation } from '../../i18n';

/**
 * First-run spotlight tour.
 *
 * Narrates the desktop by cutting a lit "hole" over a real element (a desktop
 * icon, the tray) with a large box-shadow that dims everything else, and
 * anchoring a caption card beside it. Steps that have no anchor render a
 * centered card. Anchors are resolved by CSS selector at measure time, so a
 * missing element degrades gracefully to the centered layout.
 *
 * Mounted at the app root (a sibling of the shell), so it self-scopes the
 * `dark` class to keep its `dark:` variants in sync with the shell theme —
 * the same reason ToastContainer styles itself explicitly.
 */

interface TourStep {
  titleKey: string;
  bodyKey: string;
  /** CSS selector to spotlight; omitted → centered card */
  anchor?: string;
}

const STEPS: TourStep[] = [
  { titleKey: 'tour.step.welcome.title', bodyKey: 'tour.step.welcome.body' },
  {
    titleKey: 'tour.step.calculator.title',
    bodyKey: 'tour.step.calculator.body',
    anchor: '[data-app-icon="calculator"]',
  },
  {
    titleKey: 'tour.step.inspector.title',
    bodyKey: 'tour.step.inspector.body',
    anchor: '[data-app-icon="inspector"]',
  },
  { titleKey: 'tour.step.tray.title', bodyKey: 'tour.step.tray.body', anchor: '[data-tour="tray"]' },
  { titleKey: 'tour.step.done.title', bodyKey: 'tour.step.done.body' },
];

const CARD_WIDTH = 300;

/** Position the caption card relative to the spotlighted rect (or centered). */
function cardPlacement(rect: DOMRect | null): React.CSSProperties {
  if (!rect) {
    return { left: '50%', top: '50%', transform: 'translate(-50%, -50%)' };
  }
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const left = Math.min(Math.max(rect.left, 16), Math.max(16, vw - CARD_WIDTH - 16));
  const style: React.CSSProperties = { left, width: CARD_WIDTH, maxWidth: 'calc(100vw - 32px)' };
  // Anchors low on screen (e.g. the tray) get the card above them.
  if (rect.top > vh / 2) style.bottom = vh - rect.top + 12;
  else style.top = rect.bottom + 12;
  return style;
}

export function FirstRunTour() {
  const { t } = useTranslation();
  const active = useTourStore((s) => s.active);
  const stepIndex = useTourStore((s) => s.stepIndex);
  const start = useTourStore((s) => s.start);
  const next = useTourStore((s) => s.next);
  const back = useTourStore((s) => s.back);
  const finish = useTourStore((s) => s.finish);
  const isDark = usePrefsStore((s) => s.theme === 'dark');

  const [rect, setRect] = useState<DOMRect | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const primaryBtnRef = useRef<HTMLButtonElement>(null);
  const prevFocusRef = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const bodyId = useId();

  // Auto-start once per browser (gated by the persisted `seen` flag).
  useEffect(() => {
    if (!useTourStore.getState().seen) start();
  }, [start]);

  // Capture focus when the tour starts, restore it when the tour ends.
  useEffect(() => {
    if (!active) return;
    prevFocusRef.current = document.activeElement as HTMLElement | null;
    return () => {
      const prev = prevFocusRef.current;
      if (prev?.isConnected) prev.focus();
    };
  }, [active]);

  // Keep keyboard users inside the dialog: focus the primary button each step.
  useEffect(() => {
    if (active) primaryBtnRef.current?.focus();
  }, [active, stepIndex]);

  const step = active ? STEPS[stepIndex] : undefined;

  // Measure the current step's anchor; re-measure on resize.
  useEffect(() => {
    if (!active) return;
    const measure = () => {
      const selector = STEPS[stepIndex]?.anchor;
      if (!selector) {
        setRect(null);
        return;
      }
      const el = document.querySelector(selector);
      setRect(el ? el.getBoundingClientRect() : null);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [active, stepIndex]);

  // Escape skips the tour.
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') finish();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, finish]);

  if (!active || !step) return null;

  const isLast = stepIndex === STEPS.length - 1;
  const onNext = () => (isLast ? finish() : next());

  // Wrap Tab/Shift+Tab across the card's buttons (the dim panels already
  // block pointer interaction with the rest of the shell).
  const handleCardKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'Tab') return;
    const card = cardRef.current;
    if (!card) return;
    const focusables = Array.from(card.querySelectorAll<HTMLElement>('button'));
    if (focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  // Spotlight hole = the anchor rect plus 8px padding. The dim is drawn as
  // four panels *around* the hole (cheap to paint) rather than one giant
  // box-shadow (which hangs the renderer and breaks positioning).
  const PAD = 8;
  const hole = rect
    ? { l: rect.left - PAD, t: rect.top - PAD, r: rect.right + PAD, b: rect.bottom + PAD }
    : null;

  return (
    <div className={`fixed inset-0 z-[10001] ${isDark ? 'dark' : ''}`}>
      {hole ? (
        <>
          {/* Dim panels: top, bottom, left, right of the hole (block clicks) */}
          <div className="absolute left-0 top-0 w-full bg-gray-950/70" style={{ height: Math.max(0, hole.t) }} />
          <div className="absolute left-0 right-0 bottom-0 bg-gray-950/70" style={{ top: hole.b }} />
          <div
            className="absolute bg-gray-950/70"
            style={{ left: 0, top: hole.t, width: Math.max(0, hole.l), height: hole.b - hole.t }}
          />
          <div
            className="absolute right-0 bg-gray-950/70"
            style={{ left: hole.r, top: hole.t, height: hole.b - hole.t }}
          />
          {/* Highlight border around the spotlighted element */}
          <div
            className="absolute rounded-xl ring-2 ring-white/80 pointer-events-none"
            style={{ left: hole.l, top: hole.t, width: hole.r - hole.l, height: hole.b - hole.t }}
          />
        </>
      ) : (
        <div className="absolute inset-0 bg-gray-950/70" />
      )}

      {/* Caption card */}
      <div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={bodyId}
        onKeyDown={handleCardKeyDown}
        className="absolute pointer-events-auto rounded-2xl bg-white dark:bg-neutral-800 shadow-2xl border border-black/5 dark:border-white/10 p-4"
        style={cardPlacement(rect)}
      >
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-mono text-gray-400 dark:text-gray-500">
            {t('tour.progress', { current: stepIndex + 1, total: STEPS.length })}
          </span>
          <button
            onClick={finish}
            className="text-[11px] text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
          >
            {t('tour.skip')}
          </button>
        </div>
        <h3 id={titleId} className="text-sm font-semibold text-gray-900 dark:text-gray-100">{t(step.titleKey)}</h3>
        <p id={bodyId} className="text-xs text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">{t(step.bodyKey)}</p>
        <div className="flex items-center justify-end gap-2 mt-3">
          {stepIndex > 0 && (
            <button
              onClick={back}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            >
              {t('tour.back')}
            </button>
          )}
          <button
            ref={primaryBtnRef}
            onClick={onNext}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-accent hover:brightness-110 transition-all"
          >
            {isLast ? t('tour.done') : t('tour.next')}
          </button>
        </div>
      </div>
    </div>
  );
}
