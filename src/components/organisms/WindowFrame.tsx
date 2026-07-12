import { Suspense, lazy, useCallback, useRef, useState, useEffect } from 'react';
import { Rnd } from 'react-rnd';
import { WindowState, Position, SnapZone, DEFAULT_MIN_SIZE } from '../../types/window.types';
import { useWindowStore } from '../../store/windowStore';
import { useSnapPreviewStore } from '../../store/snapPreviewStore';
import { detectSnapZone, getViewport } from '../../utils/windowGeometry';
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

/** Pointer movement (px) before a drag un-tiles a snapped window */
const UNSNAP_SLOP = 2;

/** Must match .animate-window-minimize's duration in index.css */
const MINIMIZE_ANIMATION_MS = 150;

/**
 * Extract viewport pointer coordinates from react-draggable's event,
 * which may be a mouse or touch event (touchend carries the pointer
 * only in changedTouches).
 */
function getPointerFromEvent(e: unknown): Position | null {
  const ev = e as {
    touches?: TouchList;
    changedTouches?: TouchList;
    clientX?: number;
    clientY?: number;
  };
  if (ev.touches || ev.changedTouches) {
    const touch = ev.touches?.[0] ?? ev.changedTouches?.[0];
    return touch ? { x: touch.clientX, y: touch.clientY } : null;
  }
  if (typeof ev.clientX === 'number' && typeof ev.clientY === 'number') {
    return { x: ev.clientX, y: ev.clientY };
  }
  return null;
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
    snapWindow,
    unsnapWindow,
    updateWindowPosition,
    updateWindowSize,
  } = useWindowStore();

  const setPreviewZone = useSnapPreviewStore((state) => state.setZone);
  const addToast = useToastStore((state) => state.addToast);

  // Drag-time snap tracking. Refs, not state: onDrag fires per mousemove
  // and must not re-render; the preview store re-renders only SnapPreview.
  const dragStartPointerRef = useRef<Position | null>(null);
  const armedZoneRef = useRef<SnapZone | null>(null);

  // Transient: plays the minimize animation before committing to the store
  const [isMinimizing, setIsMinimizing] = useState(false);

  const handleMinimize = () => {
    if (isMinimizing) return;
    setIsMinimizing(true);
    setTimeout(() => {
      setIsMinimizing(false);
      minimizeWindow(win.id);
    }, MINIMIZE_ANIMATION_MS);
  };

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

  const handleDragStart = (e: unknown) => {
    dragStartPointerRef.current = getPointerFromEvent(e);
    armedZoneRef.current = null;
  };

  const handleDrag = (e: unknown) => {
    const pointer = getPointerFromEvent(e);
    if (!pointer) return;

    // Dragging a tiled window restores its pre-snap size under the cursor
    if (win.snapZone) {
      const start = dragStartPointerRef.current;
      const moved =
        !start ||
        Math.abs(pointer.x - start.x) > UNSNAP_SLOP ||
        Math.abs(pointer.y - start.y) > UNSNAP_SLOP;
      if (!moved) return;
      unsnapWindow(win.id, pointer);
    }

    const zone = detectSnapZone(pointer.x, pointer.y, getViewport());
    if (zone !== armedZoneRef.current) {
      armedZoneRef.current = zone;
      setPreviewZone(zone);
    }
  };

  const handleDragStop = (
    _e: unknown,
    data: { x: number; y: number }
  ) => {
    const zone = armedZoneRef.current;
    armedZoneRef.current = null;
    setPreviewZone(null);

    if (zone) {
      // Snap commits its own geometry — don't also commit the drop position
      snapWindow(win.id, zone);
      return;
    }

    // Still snapped here means the pointer never moved (plain click on the
    // titlebar) — keep the tile instead of committing a no-op position
    if (win.snapZone) return;

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
      onDragStart={handleDragStart}
      onDrag={handleDrag}
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
          rounded-2xl overflow-hidden
          origin-bottom
          ${isMinimizing ? 'animate-window-minimize' : 'animate-window-open'}
          ${isActive
            ? 'shadow-2xl ring-1 ring-white/40'
            : 'shadow-lg ring-1 ring-white/20'
          }
        `}
      >
        {/* Title Bar */}
        <TitleBar
          title={win.title}
          isActive={isActive}
          isMaximized={win.isMaximized}
          onClose={() => closeWindow(win.id)}
          onMinimize={handleMinimize}
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
