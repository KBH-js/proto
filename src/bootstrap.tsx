import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

/**
 * Host Bootstrap
 *
 * Loaded asynchronously from main.tsx so Module Federation can resolve
 * shared modules (react/react-dom) before any eager import runs.
 */
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
