import { ComponentType, LazyExoticComponent, lazy } from 'react';
import { AppConfig, Size } from '../types/window.types';
import { AboutApp } from '../apps/AboutApp';
import { portfolioConfig } from '../config/portfolio.config';

/**
 * Registry entry for an application
 */
export interface AppRegistryEntry {
  /** The React component to render (optional - not needed for external links) */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component?: ComponentType<any> | LazyExoticComponent<ComponentType<any>>;
  /** Default configuration for this app */
  defaultConfig: AppConfig;
  /** Whether this is a remote micro-frontend loaded via Module Federation */
  isRemote?: boolean;
  /** Module name for logging (e.g., 'remoteCalculator/CalculatorApp') */
  remoteModule?: string;
}

/**
 * Lazy-loaded Calculator App from Remote Micro-Frontend
 * 
 * This component is loaded dynamically via Module Federation from
 * the remote-calculator package running on port 5001.
 * 
 * Note: If the remote fails to load, a page refresh is required to retry.
 * This is a known limitation of Module Federation (browser/runtime caching).
 * 
 * The import path 'remoteCalculator/CalculatorApp' is mapped in vite.config.ts
 * to http://localhost:5001/assets/remoteEntry.js
 */
const LazyCalculatorApp = lazy(() => import('remoteCalculator/CalculatorApp'));

/**
 * Application Registry
 * 
 * Maps component type strings to their React components and default configurations.
 * This pattern enables easy addition of new apps and future Module Federation integration.
 * 
 * ## Adding a New App
 * 
 * 1. Create your app component in `src/apps/`
 * 2. Import it here
 * 3. Add an entry to the `appRegistry` object below
 * 
 * ## Future MFE Integration
 * 
 * When migrating to Module Federation, you can replace static imports with dynamic imports:
 * 
 * ```typescript
 * // Current (static import)
 * import { MyApp } from '../apps/MyApp';
 * 
 * // Future (dynamic import / MFE)
 * const MyApp = React.lazy(() => import('remoteApp/MyApp'));
 * 
 * // Or with Module Federation
 * const MyApp = React.lazy(() => import('myRemote/MyApp'));
 * ```
 * 
 * The registry pattern keeps the rest of the codebase unchanged when switching
 * between static and dynamic loading strategies.
 */
export const appRegistry: Record<string, AppRegistryEntry> = {
  /**
   * About App - Portfolio introduction in Korean
   */
  about: {
    component: AboutApp,
    defaultConfig: {
      componentType: 'about',
      title: 'About',
      icon: 'info', // lucide icon name
      defaultSize: { w: 450, h: 580 },
    },
  },

  /**
   * Resume - External link to resume PDF
   * Configure the URL in src/config/portfolio.config.ts
   */
  resume: {
    // No component - this is an external link
    defaultConfig: {
      componentType: 'resume',
      title: 'Resume',
      icon: 'file-text', // lucide icon name
      externalUrl: portfolioConfig.resume.externalUrl || portfolioConfig.resume.pdfUrl,
    },
  },

  /**
   * Calculator App (Remote Micro-Frontend)
   * 
   * Loaded dynamically via Module Federation from packages/remote-calculator.
   * In development: localhost:5001
   * In production: Deployed on Vercel (configured via VITE_REMOTE_CALCULATOR_URL)
   */
  calculator: {
    component: LazyCalculatorApp,
    defaultConfig: {
      componentType: 'calculator',
      title: 'Calculator',
      icon: 'calculator', // lucide icon name
      defaultSize: { w: 320, h: 480 },
    },
    isRemote: true,
    remoteModule: 'remoteCalculator/CalculatorApp',
  },
};

/**
 * Get an app entry from the registry by component type
 * 
 * @param componentType - The type identifier for the app
 * @returns The registry entry or undefined if not found
 */
export function getApp(componentType: string): AppRegistryEntry | undefined {
  return appRegistry[componentType];
}

/**
 * Get all available apps for the desktop launcher
 * 
 * @returns Array of app configs that can be launched
 */
export function getAvailableApps(): AppConfig[] {
  return Object.values(appRegistry).map((entry) => entry.defaultConfig);
}

/**
 * Get the default size for an app, falling back to system default
 * 
 * @param componentType - The type identifier for the app
 * @param fallback - Fallback size if app has no default
 */
export function getAppDefaultSize(componentType: string, fallback: Size): Size {
  const app = getApp(componentType);
  return app?.defaultConfig.defaultSize ?? fallback;
}
