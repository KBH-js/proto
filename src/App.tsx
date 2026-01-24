import { WindowManagerLayout } from './components/templates/WindowManagerLayout';
import { HostProvider } from './context/HostContext';

/**
 * Root Application Component
 * 
 * Wraps the entire app with HostProvider to make host context
 * available to all components, including remote micro-frontends
 * loaded via Module Federation.
 */
function App() {
  return (
    <HostProvider>
      <WindowManagerLayout />
    </HostProvider>
  );
}

export default App;
