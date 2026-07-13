import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/**
 * First-run guide tour state.
 *
 * Only `seen` is persisted (localStorage) — it gates the auto-start so the
 * tour appears once per browser. `active`/`stepIndex` are transient runtime
 * state driving the overlay; the step *content* (anchors, copy) lives in the
 * `FirstRunTour` component, keeping this store pure and unit-testable.
 *
 * Replay (About button, desktop context menu) just calls `start()`, which
 * re-activates regardless of `seen`.
 */
interface TourState {
  /** Persisted: user has completed or skipped the first-run tour */
  seen: boolean;
  /** Transient: overlay is currently showing */
  active: boolean;
  /** Transient: current step index (0-based) */
  stepIndex: number;
  /** Begin from step 0 (first run + replay) */
  start: () => void;
  /** Advance one step (bounds handled by the caller) */
  next: () => void;
  /** Go back one step, clamped at 0 */
  back: () => void;
  /** End the tour and mark it seen (both complete and skip) */
  finish: () => void;
  /** Clear the seen flag (replay from a fresh state / tests) */
  reset: () => void;
}

export const useTourStore = create<TourState>()(
  persist(
    (set) => ({
      seen: false,
      active: false,
      stepIndex: 0,
      start: () => set({ active: true, stepIndex: 0 }),
      next: () => set((s) => ({ stepIndex: s.stepIndex + 1 })),
      back: () => set((s) => ({ stepIndex: Math.max(0, s.stepIndex - 1) })),
      finish: () => set({ active: false, seen: true }),
      reset: () => set({ seen: false }),
    }),
    {
      name: 'proto-desktop:tour',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      // Persist only the "seen" gate — runtime step state must not survive reloads.
      partialize: (s) => ({ seen: s.seen }),
    },
  ),
);
