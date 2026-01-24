import { useEffect } from 'react';
import { WindowManagerLayout } from './components/templates/WindowManagerLayout';
import { HostProvider } from './context/HostContext';
import { ToastContainer } from './components/shared/ToastContainer';
import { federationLogger } from './store/toastStore';

/**
 * Root Application Component
 * 
 * Wraps the entire app with HostProvider to make host context
 * available to all components, including remote micro-frontends
 * loaded via Module Federation.
 */
function App() {
  // Print Module Federation banner on startup
  useEffect(() => {
    federationLogger.printBanner();
  }, []);

  return (
    <HostProvider>
      <WindowManagerLayout />
      <ToastContainer />
    </HostProvider>
  );
}

export default App;
