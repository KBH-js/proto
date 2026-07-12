import { ComponentType, LazyExoticComponent, lazy } from 'react';
import { AppConfig } from '../types/window.types';
import { AboutApp } from '../apps/AboutApp';
import { portfolioConfig } from '../config/portfolio.config';

export interface AppRegistryEntry {
  /** Omitted for entries that open an external link instead of a window */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component?: ComponentType<any> | LazyExoticComponent<ComponentType<any>>;
  defaultConfig: AppConfig;
  /** Loaded via Module Federation */
  isRemote?: boolean;
  /** Module name for logging (e.g., 'remoteCalculator/CalculatorApp') */
  remoteModule?: string;
}

// Resolved at runtime from the remote's remoteEntry.js (see vite.config.ts).
// If the remote fails to load, a page refresh is required to retry — known
// limitation of Module Federation (browser/runtime caching).
const LazyCalculatorApp = lazy(() => import('remoteCalculator/CalculatorApp'));

export const appRegistry: Record<string, AppRegistryEntry> = {
  about: {
    component: AboutApp,
    defaultConfig: {
      componentType: 'about',
      title: 'About',
      icon: 'info',
      defaultSize: { w: 450, h: 580 },
    },
  },

  resume: {
    defaultConfig: {
      componentType: 'resume',
      title: 'Resume',
      icon: 'file-text',
      externalUrl: portfolioConfig.resume.externalUrl,
    },
  },

  calculator: {
    component: LazyCalculatorApp,
    defaultConfig: {
      componentType: 'calculator',
      title: 'Calculator',
      icon: 'calculator',
      defaultSize: { w: 320, h: 480 },
    },
    isRemote: true,
    remoteModule: 'remoteCalculator/CalculatorApp',
  },
};

export function getApp(componentType: string): AppRegistryEntry | undefined {
  return appRegistry[componentType];
}

export function getAvailableApps(): AppConfig[] {
  return Object.values(appRegistry).map((entry) => entry.defaultConfig);
}
