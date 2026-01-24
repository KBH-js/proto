import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    /**
     * Module Federation Configuration for Remote Calculator
     * 
     * This configuration exposes the CalculatorApp component to be consumed
     * by the host application (the main OS shell).
     * 
     * Key settings:
     * - name: Unique identifier for this remote (used by host to reference it)
     * - filename: The generated manifest file that host loads to discover exposed modules
     * - exposes: Maps module paths to actual file paths (./CalculatorApp -> src/CalculatorApp.tsx)
     * - shared: Dependencies shared with host to avoid duplicate instances
     */
    federation({
      name: 'remoteCalculator',
      filename: 'remoteEntry.js',
      exposes: {
        // Expose the Calculator component for the host to consume
        // Host will import as: import('remoteCalculator/CalculatorApp')
        './CalculatorApp': './src/CalculatorApp.tsx',
      },
      shared: {
        // React must be shared as singleton to prevent "multiple React instances" error
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
  
  // Dev server configuration
  server: {
    port: 5001,
    strictPort: true, // Fail if port is already in use
    cors: true, // Enable CORS for cross-origin module loading
  },
  
  // Preview server (for testing production build)
  preview: {
    port: 5001,
    strictPort: true,
    cors: true,
  },
  
  // Build configuration
  build: {
    // Required for Module Federation top-level await support
    target: 'esnext',
    minify: false, // Easier debugging during development
    cssCodeSplit: false, // Bundle all CSS together
  },
});
