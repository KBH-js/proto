import { useEffect, useState } from 'react';
import { WindowManagerLayout } from './components/templates/WindowManagerLayout';
import { ToastContainer } from './components/shared/ToastContainer';
import { BootScreen } from './components/shared/BootScreen';
import { initializeAppRegistry, useAppRegistry } from './registry/appRegistry';
import { useWindowStore } from './store/windowStore';

const RESIZE_DEBOUNCE_MS = 150;

function App() {
  const [bootAnimationDone, setBootAnimationDone] = useState(false);
  const registryStatus = useAppRegistry((state) => state.status);

  // Fetch the remote app catalog and register remotes with the MF runtime.
  // Idempotent — guarded against StrictMode double-invocation internally.
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

  // Boot screen stays up until the animation finishes AND the app catalog
  // resolves (ready or degraded) — so the desktop never flashes half-empty.
  const isBooting = !bootAnimationDone || registryStatus === 'loading';

  const handleBootComplete = () => {
    setBootAnimationDone(true);
  };

  return (
    <>
      {isBooting && (
        <BootScreen onBootComplete={handleBootComplete} duration={1200} />
      )}

      <WindowManagerLayout />
      <ToastContainer />
    </>
  );
}

export default App;
