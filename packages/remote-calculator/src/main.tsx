import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import CalculatorApp from './CalculatorApp';

// Minimal standalone entry - will be enhanced in Task 6.0
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CalculatorApp />
  </StrictMode>,
);
