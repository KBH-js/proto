import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './standalone.css';
import App from './App';

/**
 * Standalone Mode Bootstrap
 *
 * Actual render logic for standalone mode, loaded asynchronously from
 * main.tsx. The async boundary lets Module Federation resolve shared
 * modules (react/react-dom) before any eager import runs.
 *
 * Note: When the Notes app is loaded via Module Federation, only
 * NotesApp.tsx is exposed and consumed directly by the host.
 */
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
