import { useWindowStore } from '../../store/windowStore';
import { Desktop } from '../organisms/Desktop';
import { WindowFrame } from '../organisms/WindowFrame';
import { Taskbar } from '../organisms/Taskbar';

/**
 * Main layout template that assembles all window manager components.
 * Renders: Desktop (base) → Windows → Taskbar (top)
 */
export function WindowManagerLayout() {
  const windows = useWindowStore((state) => state.windows);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black">
      {/* Desktop - base layer with app icons */}
      <Desktop />

      {/* Windows layer - renders all open windows */}
      {windows.map((win) => (
        <WindowFrame key={win.id} window={win} />
      ))}

      {/* Taskbar - always on top */}
      <Taskbar />
    </div>
  );
}
