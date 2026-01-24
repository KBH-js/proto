import { Suspense } from 'react';
import { Rnd } from 'react-rnd';
import { WindowState, DEFAULT_MIN_SIZE } from '../../types/window.types';
import { useWindowStore } from '../../store/windowStore';
import { getApp } from '../../registry/appRegistry';
import { TitleBar, DRAG_HANDLE_CLASS } from './TitleBar';
import { ErrorBoundary } from '../shared/ErrorBoundary';
import { LoadingFallback } from '../shared/LoadingFallback';

interface WindowFrameProps {
  /** The window state object */
  window: WindowState;
}

/**
 * Window frame component with drag and resize functionality.
 * Uses react-rnd for smooth drag/resize interactions.
 */
export function WindowFrame({ window: win }: WindowFrameProps) {
  const {
    activeWindowId,
    focusWindow,
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    restoreWindow,
    updateWindowPosition,
    updateWindowSize,
  } = useWindowStore();

  const isActive = activeWindowId === win.id;

  // Get the app component from registry
  const appEntry = getApp(win.componentType);
  const AppComponent = appEntry?.component;

  // Don't render if minimized
  if (win.isMinimized) {
    return null;
  }

  const handleDragStop = (
    _e: unknown,
    data: { x: number; y: number }
  ) => {
    updateWindowPosition(win.id, { x: data.x, y: data.y });
  };

  const handleResizeStop = (
    _e: unknown,
    _direction: unknown,
    ref: HTMLElement,
    _delta: unknown,
    position: { x: number; y: number }
  ) => {
    updateWindowSize(win.id, {
      w: ref.offsetWidth,
      h: ref.offsetHeight,
    });
    updateWindowPosition(win.id, position);
  };

  const handleMouseDown = () => {
    if (!isActive) {
      focusWindow(win.id);
    }
  };

  const handleMaximizeToggle = () => {
    if (win.isMaximized) {
      restoreWindow(win.id);
    } else {
      maximizeWindow(win.id);
    }
  };

  return (
    <Rnd
      position={{ x: win.position.x, y: win.position.y }}
      size={{ width: win.size.w, height: win.size.h }}
      minWidth={DEFAULT_MIN_SIZE.w}
      minHeight={DEFAULT_MIN_SIZE.h}
      dragHandleClassName={DRAG_HANDLE_CLASS}
      onDragStop={handleDragStop}
      onResizeStop={handleResizeStop}
      onMouseDown={handleMouseDown}
      disableDragging={win.isMaximized}
      enableResizing={!win.isMaximized}
      style={{
        zIndex: win.zIndex,
      }}
      bounds="parent"
    >
      <div
        className={`
          flex flex-col h-full
          rounded-lg overflow-hidden
          ${isActive
            ? 'shadow-2xl ring-1 ring-black/10'
            : 'shadow-lg ring-1 ring-black/5'
          }
        `}
      >
        {/* Title Bar */}
        <TitleBar
          title={win.title}
          isActive={isActive}
          isMaximized={win.isMaximized}
          onClose={() => closeWindow(win.id)}
          onMinimize={() => minimizeWindow(win.id)}
          onMaximize={handleMaximizeToggle}
        />

        {/* Content Area */}
        <div className="flex-1 bg-white overflow-auto">
          {AppComponent ? (
            <ErrorBoundary appName={win.title}>
              <Suspense fallback={<LoadingFallback message={`Loading ${win.title}...`} />}>
                <AppComponent />
              </Suspense>
            </ErrorBoundary>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              App not found: {win.componentType}
            </div>
          )}
        </div>
      </div>
    </Rnd>
  );
}
