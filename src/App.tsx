import { useEffect, useState } from 'react';
import { WindowManagerLayout } from './components/templates/WindowManagerLayout';
import { ToastContainer } from './components/shared/ToastContainer';
import { BootScreen } from './components/shared/BootScreen';
import { initializeAppRegistry, useAppRegistry } from './registry/appRegistry';

function App() {
  const [bootAnimationDone, setBootAnimationDone] = useState(false);
  const registryStatus = useAppRegistry((state) => state.status);

  // Fetch the remote app catalog and register remotes with the MF runtime.
  // Idempotent — guarded against StrictMode double-invocation internally.
  useEffect(() => {
    initializeAppRegistry();
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
