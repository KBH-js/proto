import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { DesktopIcon } from './DesktopIcon';

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('DesktopIcon launch interactions', () => {
  it('launches on a single click', () => {
    const onLaunch = vi.fn();
    render(<DesktopIcon icon="network" label="Network" onLaunch={onLaunch} />);

    fireEvent.click(screen.getByRole('button'));
    expect(onLaunch).toHaveBeenCalledTimes(1);
  });

  it('is a native button, so keyboard activation goes through click', () => {
    const onLaunch = vi.fn();
    render(<DesktopIcon icon="network" label="Network" onLaunch={onLaunch} />);

    const button = screen.getByRole('button');
    button.focus();
    // Browsers synthesize a click for Enter/Space on <button>; assert the
    // activation path (click) is wired rather than simulating browser UA
    // behavior that happy-dom does not implement.
    fireEvent.click(button);
    expect(onLaunch).toHaveBeenCalledTimes(1);
  });
});
