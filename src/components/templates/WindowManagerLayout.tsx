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
      <div className="absolute inset-0 pointer-events-none">
        <div className="relative w-full h-full pointer-events-auto">
          {windows.map((win) => (
            <WindowFrame key={win.id} window={win} />
          ))}
        </div>
      </div>

      {/* Taskbar - always on top */}
      <Taskbar />

      {/* Minimum width warning for small screens */}
      <MinWidthWarning />
    </div>
  );
}

/**
 * Warning overlay shown when viewport is too narrow (< 1024px)
 */
function MinWidthWarning() {
  return (
    <div className="fixed inset-0 bg-gray-900 flex items-center justify-center z-[99999] lg:hidden">
      <div className="text-center p-8">
        <div className="text-6xl mb-4">🖥️</div>
        <h1 className="text-2xl font-bold text-white mb-2">
          Desktop Only
        </h1>
        <p className="text-gray-400 max-w-sm">
          This window manager is designed for desktop screens.
          Please use a device with a screen width of at least 1024px.
        </p>
      </div>
    </div>
  );
}
