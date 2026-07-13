import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { initHostBridge } from './federation/hostBridge';

/**
 * Host Bootstrap
 *
 * Loaded asynchronously from main.tsx so Module Federation can resolve
 * shared modules (react/react-dom) before any eager import runs.
 */

// Expose shell locale/theme to remotes before any remote can mount.
initHostBridge();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
