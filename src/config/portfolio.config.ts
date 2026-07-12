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
    externalUrl: 'https://drive.google.com/file/d/1BBgtA6_ieEF_RAfXL0rYhCek4xepqWQL/view?usp=sharing', // e.g., 'https://drive.google.com/your-resume-link'
  },

  // Remote micro-frontends are NOT configured here — they are declared in
  // public/remotes.manifest.json and registered with the Module Federation
  // runtime at boot. See src/federation/ and src/registry/appRegistry.ts.
} as const;

/**
 * Check if we're running in development mode
 */
export const isDevelopment = import.meta.env.DEV;

/**
 * Check if we're running in production mode
 */
export const isProduction = import.meta.env.PROD;
