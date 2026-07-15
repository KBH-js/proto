import { afterEach, describe, expect, it } from 'vitest';
import { useRef, useState } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { StartMenu } from './StartMenu';

/** Anchor button + menu, wired the same way Taskbar does it. */
function Harness() {
  const anchorRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  return (
    <>
      <button ref={anchorRef} onClick={() => setOpen(!open)}>
        start
      </button>
      {open && <StartMenu anchorRef={anchorRef} onClose={() => setOpen(false)} />}
    </>
  );
}

function openMenu() {
  const startButton = screen.getByRole('button', { name: 'start' });
  startButton.focus();
  fireEvent.click(startButton);
  return startButton;
}

afterEach(cleanup);

describe('StartMenu keyboard access', () => {
  it('renders as an ARIA menu and focuses the first menuitem on open', () => {
    render(<Harness />);
    openMenu();

    expect(screen.getByRole('menu')).toBeTruthy();
    const items = screen.getAllByRole('menuitem');
    expect(items.length).toBeGreaterThan(0);
    expect(document.activeElement).toBe(items[0]);
  });

  it('moves focus with ArrowDown', () => {
    render(<Harness />);
    openMenu();

    const menu = screen.getByRole('menu');
    const items = screen.getAllByRole('menuitem');
    fireEvent.keyDown(menu, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(items[1]);
  });

  it('closes on Escape and returns focus to the start button', () => {
    render(<Harness />);
    const startButton = openMenu();

    fireEvent.keyDown(screen.getByRole('menu'), { key: 'Escape' });
    expect(screen.queryByRole('menu')).toBeNull();
    expect(document.activeElement).toBe(startButton);
  });
});
