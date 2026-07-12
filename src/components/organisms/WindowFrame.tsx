import { Suspense, lazy, useCallback, useRef, useState, useEffect } from 'react';
import { Rnd } from 'react-rnd';
import { WindowState, DEFAULT_MIN_SIZE } from '../../types/window.types';
import { useWindowStore } from '../../store/windowStore';
import { useAppRegistry } from '../../registry/appRegistry';
import { loadRemoteComponent, forceRefreshRemote } from '../../federation/runtime';
import { TitleBar, DRAG_HANDLE_CLASS } from './TitleBar';
import { ErrorBoundary } from '../shared/ErrorBoundary';
import { LoadingFallback } from '../shared/LoadingFallback';
import { useToastStore, federationLogger } from '../../store/toastStore';

interface WindowFrameProps {
  /** The window state object */
  window: WindowState;
}

/**
 * Wrapper component that tracks when a remote app finishes loading
 * Calls onLoad callback when children are rendered (meaning Suspense resolved)
 */
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
  
  const addToast = useToastStore((state) => state.addToast);

  const isActive = activeWindowId === win.id;
  
  // Track load time for remote apps
  const loadStartTime = useRef<number>(Date.now());
  const hasLoggedRef = useRef(false);

  // Get the app entry from the registry (reactive — remote apps appear
  // after the catalog resolves at runtime)
  const appEntry = useAppRegistry((state) => state.entries[win.componentType]);
  const remote = appEntry?.remote;
  const isRemote = appEntry?.isRemote ?? false;
  const remoteModule = remote ? `${remote.name}/${remote.module}` : undefined;

  // Remote apps get a per-window lazy wrapper that loads through the MF
  // runtime — failures reject into this window's ErrorBoundary only.
  // React.lazy permanently caches a rejected load promise, so retry must
  // produce a FRESH wrapper. The wrapper lives in useState (not useMemo):
  // state updates survive React Compiler memoization, guaranteeing the
  // stale wrapper is actually replaced on retry.
  const [remoteComponent, setRemoteComponent] = useState(() =>
    remote ? lazy(() => loadRemoteComponent(`${remote.name}/${remote.module}`)) : null,
  );

  const AppComponent = appEntry?.component ?? remoteComponent;

  // Recovery flow for a failed remote load: reset the MF runtime's cached
  // container for this remote (force re-registration), then swap in a
  // fresh lazy wrapper. Other windows — including healthy windows of the
  // SAME remote — are unaffected: their module code is already running
  // in the React tree.
  const handleRetry = useCallback(() => {
    if (!remote) return;
    forceRefreshRemote({ name: remote.name, entry: remote.entry });
    hasLoggedRef.current = false;
    loadStartTime.current = Date.now();
    setRemoteComponent(() =>
      lazy(() => loadRemoteComponent(`${remote.name}/${remote.module}`)),
    );
  }, [remote]);

  // Callback when remote component loads successfully
  const handleRemoteLoaded = () => {
    // Use ref to prevent double logging in StrictMode
    if (isRemote && !hasLoggedRef.current && remoteModule) {
      hasLoggedRef.current = true;
      
      const loadTime = Date.now() - loadStartTime.current;
      
      // Styled console log
      federationLogger.moduleLoaded(remoteModule, loadTime);
      
      // Toast notification
      addToast({
        type: 'system',
        message: `Remote Module '${remoteModule}' loaded in ${loadTime}ms`,
        duration: 4000,
      });
    }
  };

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
          isRemote={isRemote}
        />

        {/* Content Area */}
        <div className="flex-1 bg-white overflow-auto">
          {AppComponent ? (
            <ErrorBoundary
              appName={win.title}
              onClose={() => closeWindow(win.id)}
              onRetry={isRemote ? handleRetry : undefined}
            >
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
