import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './standalone.css';
import App from './App';

/**
 * Standalone Mode Bootstrap (async boundary target of main.tsx).
 *
 * Starts the MSW service worker so the standalone page performs real
 * `/api/nova/*` REST (visible in DevTools), then flips `__PROTO_COMPUTE_MSW__`
 * so the api facade uses the fetch transport. If the worker can't start (e.g.
 * missing service worker file) it degrades to the in-memory transport.
 */
async function start() {
  try {
    const { worker } = await import('./mocks/browser');
    await worker.start({ onUnhandledRequest: 'bypass', quiet: true });
    window.__PROTO_COMPUTE_MSW__ = true;
  } catch {
    window.__PROTO_COMPUTE_MSW__ = false;
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

void start();
