// Type declarations for modules exposed by remotes via Module Federation.
// Add a declare module block here when registering a new remote.

declare module 'remoteCalculator/CalculatorApp' {
  import { ComponentType } from 'react';

  const CalculatorApp: ComponentType;
  export default CalculatorApp;
}
