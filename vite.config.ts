import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables based on mode (development/production)
  const env = loadEnv(mode, process.cwd(), '');
  
  // Remote URLs - use environment variables for production, fallback to localhost for dev
  const REMOTE_CALCULATOR_URL = env.VITE_REMOTE_CALCULATOR_URL 
    || 'http://localhost:5001/assets/remoteEntry.js';

  return {
    plugins: [
      react({
        babel: {
          plugins: ['babel-plugin-react-compiler'],
        },
      }),
      /**
       * Module Federation Configuration for Host (OS Shell)
       * 
       * This configuration consumes remote micro-frontend applications.
       * Each remote exposes components that can be dynamically loaded.
       * 
       * Key settings:
       * - name: Identifier for this host application
       * - remotes: Map of remote names to their entry point URLs
       * - shared: Dependencies shared with remotes to avoid duplicate instances
       * 
       * Environment Variables:
       * - VITE_REMOTE_CALCULATOR_URL: Production URL for calculator remote
       */
      federation({
        name: 'host',
        remotes: {
          // Remote Calculator app
          // Development: http://localhost:5001/assets/remoteEntry.js
          // Production: Set via VITE_REMOTE_CALCULATOR_URL environment variable
          remoteCalculator: REMOTE_CALCULATOR_URL,
        },
      shared: {
        // React must be shared as singleton to prevent "multiple React instances" error
        // Both host and remotes will use the same React instance
        react: {
          singleton: true,
          requiredVersion: '^19.0.0',
        },
        'react-dom': {
          singleton: true,
          requiredVersion: '^19.0.0',
        },
      },
    }),
  ],
  
  // Build configuration
  build: {
    // Required for Module Federation top-level await support
    target: 'esnext',
    modulePreload: false,
    minify: false,
    cssCodeSplit: false,
  },
  
  // Define environment variables for client-side access
  define: {
    __REMOTE_CALCULATOR_URL__: JSON.stringify(REMOTE_CALCULATOR_URL),
  },
};
});
