/**
 * TypeScript Module Declarations for Remote Micro-Frontends
 * 
 * This file provides type declarations for components exposed by remote
 * applications via Module Federation. Without these declarations,
 * TypeScript would report errors when importing remote modules.
 * 
 * When adding a new remote:
 * 1. Add a declare module statement below
 * 2. Export the component type (usually React.ComponentType or React.FC)
 * 
 * Example:
 * ```typescript
 * declare module 'myRemote/MyComponent' {
 *   const MyComponent: React.ComponentType<{ someProp?: string }>;
 *   export default MyComponent;
 * }
 * ```
 */

// Remote Calculator App
// Exposed by: packages/remote-calculator
// URL: http://localhost:5001/assets/remoteEntry.js
declare module 'remoteCalculator/CalculatorApp' {
  import { ComponentType } from 'react';
  
  /**
   * Calculator component exposed via Module Federation
   * Renders a fully functional calculator with basic arithmetic operations
   */
  const CalculatorApp: ComponentType;
  export default CalculatorApp;
}
