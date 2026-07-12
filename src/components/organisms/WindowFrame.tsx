import { Suspense, useRef, useEffect } from 'react';
import { Rnd } from 'react-rnd';
import { WindowState, DEFAULT_MIN_SIZE } from '../../types/window.types';
import { useWindowStore } from '../../store/windowStore';
import { getApp } from '../../registry/appRegistry';
import { TitleBar, DRAG_HANDLE_CLASS } from './TitleBar';
import { ErrorBoundary } from '../shared/ErrorBoundary';
import { LoadingFallback } from '../shared/LoadingFallback';
import { useToastStore, federationLogger } from '../../store/toastStore';

interface WindowFrameProps {
  window: WindowState;
}

// Fires onLoad once its children render, i.e. once Suspense has resolved
// the lazy remote module.
function RemoteLoadTracker({
  children, 
  onLoad, 
  isRemote 
}: { 
  children: React.ReactNode; 
  onLoad: () => void;
  isRemote: boolean;
}) {
  useEffect(() => {
    if (isRemote) {
      onLoad();
    }
  }, [onLoad, isRemote]);
  
  return <>{children}</>;
}

/** react-rnd based window body: drag, resize, focus, minimize/maximize */
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
  
  const addToast = useToastStore((state) => state.addToast);

  const isActive = activeWindowId === win.id;

  const loadStartTime = useRef<number>(Date.now());
  const hasLoggedRef = useRef(false);

  const appEntry = getApp(win.componentType);
  const AppComponent = appEntry?.component;
  const isRemote = appEntry?.isRemote ?? false;
  const remoteModule = appEntry?.remoteModule;

  const handleRemoteLoaded = () => {
    // hasLoggedRef prevents double logging under StrictMode
    if (isRemote && !hasLoggedRef.current && remoteModule) {
      hasLoggedRef.current = true;

      const loadTime = Date.now() - loadStartTime.current;

      federationLogger.moduleLoaded(remoteModule, loadTime);
      addToast({
        type: 'system',
        message: `Remote Module '${remoteModule}' loaded in ${loadTime}ms`,
        duration: 4000,
      });
    }
  };

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
        <TitleBar
          title={win.title}
          isActive={isActive}
          isMaximized={win.isMaximized}
          onClose={() => closeWindow(win.id)}
          onMinimize={() => minimizeWindow(win.id)}
          onMaximize={handleMaximizeToggle}
          isRemote={isRemote}
        />

        <div className="flex-1 bg-white overflow-auto">
          {AppComponent ? (
            <ErrorBoundary appName={win.title} onClose={() => closeWindow(win.id)}>
              <Suspense fallback={<LoadingFallback message={`Loading ${win.title}...`} />}>
                <RemoteLoadTracker onLoad={handleRemoteLoaded} isRemote={isRemote}>
                  <AppComponent />
                </RemoteLoadTracker>
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
