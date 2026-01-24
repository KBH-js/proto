import { useEffect, useState } from 'react';
import { WindowManagerLayout } from './components/templates/WindowManagerLayout';
import { HostProvider } from './context/HostContext';
import { ToastContainer } from './components/shared/ToastContainer';
import { BootScreen } from './components/shared/BootScreen';
import { federationLogger } from './store/toastStore';

/**
 * Root Application Component
 * 
 * Wraps the entire app with HostProvider to make host context
 * available to all components, including remote micro-frontends
 * loaded via Module Federation.
 */
function App() {
  const [isBooting, setIsBooting] = useState(true);

  // Print Module Federation banner on startup
  useEffect(() => {
    federationLogger.printBanner();
  }, []);

  const handleBootComplete = () => {
    setIsBooting(false);
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
