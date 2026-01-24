import { ComponentType } from 'react';
import { AppConfig, Size } from '../types/window.types';
import { PlaceholderApp, AboutApp, SettingsApp } from '../apps/PlaceholderApp';

/**
 * Registry entry for an application
 */
export interface AppRegistryEntry {
  /** The React component to render (accepts any props) */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: ComponentType<any>;
  /** Default configuration for this app */
  defaultConfig: AppConfig;
}

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
  placeholder: {
    component: PlaceholderApp,
    defaultConfig: {
      componentType: 'placeholder',
      title: 'Placeholder',
      icon: '📦',
    },
  },
  
  about: {
    component: AboutApp,
    defaultConfig: {
      componentType: 'about',
      title: 'About',
      icon: '🖥️',
      defaultSize: { w: 400, h: 450 },
    },
  },
  
  settings: {
    component: SettingsApp,
    defaultConfig: {
      componentType: 'settings',
      title: 'Settings',
      icon: '⚙️',
      defaultSize: { w: 500, h: 400 },
    },
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
