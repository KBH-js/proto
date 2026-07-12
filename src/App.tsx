import { useEffect, useState } from 'react';
import { WindowManagerLayout } from './components/templates/WindowManagerLayout';
import { ToastContainer } from './components/shared/ToastContainer';
import { BootScreen } from './components/shared/BootScreen';
import { federationLogger } from './store/toastStore';

function App() {
  const [isBooting, setIsBooting] = useState(true);

  useEffect(() => {
    federationLogger.printBanner();
  }, []);

  const handleBootComplete = () => {
    setIsBooting(false);
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
