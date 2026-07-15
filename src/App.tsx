import { useEffect, useState } from 'react';
import { LiquidGlassFilters } from '@proto/shared/glass';
import { WindowManagerLayout } from './components/templates/WindowManagerLayout';
import { ToastContainer } from './components/shared/ToastContainer';
import { BootScreen } from './components/shared/BootScreen';
import { FirstRunTour } from './components/shared/FirstRunTour';
import { initializeAppRegistry } from './registry/appRegistry';
import { useWindowStore } from './store/windowStore';
import { useShortcuts } from './hooks/useShortcuts';

const RESIZE_DEBOUNCE_MS = 150;

function App() {
  // BootScreen owns the gate: it holds until the app catalog resolves (it reads
  // the registry status itself), then calls back to reveal the desktop.
  const [booting, setBooting] = useState(true);

  // Global keyboard shortcuts (Alt+A/I/T/L, Alt+/)
  useShortcuts();

  // Fetch the remote app catalog and register remotes with the MF runtime.
  // Idempotent on store state — StrictMode double-invocation joins the
  // in-flight fetch, and a dev-HMR store reset re-runs the merge.
  useEffect(() => {
    initializeAppRegistry();
  }, []);

  // Refit windows (maximized/snapped/floating) when the viewport changes
  useEffect(() => {
    let timer: number | undefined;
    const handleResize = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        useWindowStore.getState().handleViewportResize();
      }, RESIZE_DEBOUNCE_MS);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <>
      {/* Shared Liquid Glass SVG displacement filters — mounted once for the
          whole federation (host + any remote consuming the singleton). */}
      <LiquidGlassFilters />

      {booting && <BootScreen onBootComplete={() => setBooting(false)} />}

      <WindowManagerLayout />
      <ToastContainer />
      {!booting && <FirstRunTour />}
    </>
  );
}

export default App;
