/**
 * Portfolio Configuration
 * 
 * Centralized configuration for all portfolio-related settings.
 * Edit this file to customize your portfolio URLs and information.
 */

export const portfolioConfig = {
  // ==========================================================================
  // Personal Information
  // ==========================================================================
  owner: {
    name: 'Byunghoon Kang',
    title: 'Frontend Engineer',
    email: 'byunghoon.kang.job@gmail.com',
  },

  // ==========================================================================
  // Social Links (displayed in Start Menu)
  // ==========================================================================
  links: {
    github: 'https://github.com/KBH-js', 
    linkedin: 'https://www.linkedin.com/in/byunghoon-kang-293369302/',
    email: 'mailto:byunghoon.kang.job@gmail.com',
  },

  // ==========================================================================
  // Resume Configuration
  // ==========================================================================
  resume: {
    externalUrl: 'https://drive.google.com/file/d/1495QmVmyYEEJuA8ZxIpX8SW3-tvF72YK/view?usp=sharing', // e.g., 'https://drive.google.com/your-resume-link'
  },

  // ==========================================================================
  // Remote Micro-Frontend Configuration
  // ==========================================================================
  remotes: {
    calculator: {
      // Display name shown in UI
      name: 'Calculator',
      // Module name for Module Federation
      moduleName: 'remoteCalculator/CalculatorApp',
      // Production URL (Vercel deployed)
      productionUrl: import.meta.env.VITE_REMOTE_CALCULATOR_URL || '',
      // Whether this is a remote MFE (always true for remotes)
      isRemote: true,
    },
  },
} as const;

/**
 * Check if we're running in development mode
 */
export const isDevelopment = import.meta.env.DEV;

/**
 * Check if we're running in production mode
 */
export const isProduction = import.meta.env.PROD;

/**
 * Get the display label for a remote app
 * In development: shows "REMOTE" with localhost indicator
 * In production: shows "REMOTE" (deployed on Vercel)
 */
export function getRemoteLabel(remoteName: keyof typeof portfolioConfig.remotes): string {
  return isDevelopment ? 'REMOTE (DEV)' : 'REMOTE';
}

/**
 * Get remote info for display
 */
export function getRemoteInfo(remoteName: keyof typeof portfolioConfig.remotes) {
  const remote = portfolioConfig.remotes[remoteName];
  return {
    ...remote,
    displayLabel: getRemoteLabel(remoteName),
    tooltip: isDevelopment 
      ? 'Loaded from localhost (development)' 
      : 'Loaded via Module Federation (Vercel)',
  };
}
