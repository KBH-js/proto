import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

/**
 * Standalone Mode Entry Point
 * 
 * This file is the entry point when running the calculator in standalone mode
 * via `pnpm dev`. It renders the App component which includes:
 * - MockHostProvider for simulating host context
 * - Full-page layout with centered calculator
 * 
 * Note: When the calculator is loaded via Module Federation, only
 * CalculatorApp.tsx is exposed and consumed directly by the host.
 */
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
