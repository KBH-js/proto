import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Debug: Expose Host's React instance for shared dependency verification
// Remote apps can compare their React with window.HOST_REACT to confirm singleton
(window as unknown as { HOST_REACT: typeof React }).HOST_REACT = React;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
