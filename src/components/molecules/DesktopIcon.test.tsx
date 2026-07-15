import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { DesktopIcon } from './DesktopIcon';
import { isTouchDevice } from '../../utils/device';

vi.mock('../../utils/device', () => ({
  isTouchDevice: vi.fn(() => false),
}));

const mockedIsTouchDevice = vi.mocked(isTouchDevice);

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('DesktopIcon launch interactions', () => {
  it('launches on Enter when focused (pointer devices)', () => {
    mockedIsTouchDevice.mockReturnValue(false);
    const onLaunch = vi.fn();
    render(<DesktopIcon icon="calculator" label="Calculator" onLaunch={onLaunch} />);

    const button = screen.getByRole('button');
    button.focus();
    fireEvent.keyDown(button, { key: 'Enter' });

    expect(onLaunch).toHaveBeenCalledTimes(1);
  });

  it('launches on Space but ignores key repeat', () => {
    mockedIsTouchDevice.mockReturnValue(false);
    const onLaunch = vi.fn();
    render(<DesktopIcon icon="calculator" label="Calculator" onLaunch={onLaunch} />);

    const button = screen.getByRole('button');
    fireEvent.keyDown(button, { key: ' ' });
    fireEvent.keyDown(button, { key: ' ', repeat: true });

    expect(onLaunch).toHaveBeenCalledTimes(1);
  });

  it('does not launch on single click, launches on double-click (pointer devices)', () => {
    mockedIsTouchDevice.mockReturnValue(false);
    const onLaunch = vi.fn();
    render(<DesktopIcon icon="calculator" label="Calculator" onLaunch={onLaunch} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(onLaunch).not.toHaveBeenCalled();

    fireEvent.doubleClick(button);
    expect(onLaunch).toHaveBeenCalledTimes(1);
  });

  it('launches on single click on touch devices', () => {
    mockedIsTouchDevice.mockReturnValue(true);
    const onLaunch = vi.fn();
    render(<DesktopIcon icon="calculator" label="Calculator" onLaunch={onLaunch} />);

    fireEvent.click(screen.getByRole('button'));
    expect(onLaunch).toHaveBeenCalledTimes(1);
  });
});
