import { describe, it, expect, beforeEach } from 'vitest';
import { useTourStore } from './tourStore';

const reset = () => {
  useTourStore.setState({ seen: false, active: false, stepIndex: 0 });
  localStorage.clear();
};

beforeEach(reset);

describe('tourStore', () => {
  it('is inactive and unseen by default', () => {
    const s = useTourStore.getState();
    expect(s.seen).toBe(false);
    expect(s.active).toBe(false);
    expect(s.stepIndex).toBe(0);
  });

  it('start() activates the tour from step 0', () => {
    useTourStore.setState({ active: false, stepIndex: 3 });
    useTourStore.getState().start();
    expect(useTourStore.getState().active).toBe(true);
    expect(useTourStore.getState().stepIndex).toBe(0);
  });

  it('next() advances and back() clamps at 0', () => {
    const { start, next, back } = useTourStore.getState();
    start();
    next();
    next();
    expect(useTourStore.getState().stepIndex).toBe(2);
    back();
    expect(useTourStore.getState().stepIndex).toBe(1);
    back();
    back();
    expect(useTourStore.getState().stepIndex).toBe(0);
  });

  it('finish() ends the tour and marks it seen', () => {
    useTourStore.getState().start();
    useTourStore.getState().finish();
    const s = useTourStore.getState();
    expect(s.active).toBe(false);
    expect(s.seen).toBe(true);
  });

  it('reset() clears the seen flag so the tour can be replayed fresh', () => {
    useTourStore.setState({ seen: true });
    useTourStore.getState().reset();
    expect(useTourStore.getState().seen).toBe(false);
  });
});
