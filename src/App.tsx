import { useEffect, useState } from 'react';
import { WindowManagerLayout } from './components/templates/WindowManagerLayout';
import { HostProvider } from './context/HostContext';
import { ToastContainer } from './components/shared/ToastContainer';
import { BootScreen } from './components/shared/BootScreen';
import { initializeAppRegistry, useAppRegistry } from './registry/appRegistry';

/**
 * Root Application Component
 *
 * Wraps the entire app with HostProvider to make host context
 * available to all components, including remote micro-frontends
 * loaded via Module Federation.
 */
function App() {
  const [bootAnimationDone, setBootAnimationDone] = useState(false);
  const registryStatus = useAppRegistry((state) => state.status);

  // Resolve the remote app catalog and register remotes with the MF runtime.
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
    <HostProvider>
      {/* Boot Screen - shows terminal-style loading animation */}
      {isBooting && (
        <BootScreen
          onBootComplete={handleBootComplete}
          duration={1200} // 1.2 seconds for full effect
        />
      )}
      
      <WindowManagerLayout />
      <ToastContainer />
    </HostProvider>
  );
}

export default App;
