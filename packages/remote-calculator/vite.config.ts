import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'remoteCalculator',
      filename: 'remoteEntry.js',
      exposes: {
        './CalculatorApp': './src/CalculatorApp.tsx',
      },
      shared: {
        // Singleton to prevent "multiple React instances"; generate: false
        // makes the remote consume the host's shared modules.
        react: {
          singleton: true,
          requiredVersion: '^19.0.0',
          generate: false,
        },
        'react-dom': {
          singleton: true,
          requiredVersion: '^19.0.0',
          generate: false,
        },
      },
    }),
  ],

  server: {
    port: 5001,
    strictPort: true,
    cors: true,
  },

  preview: {
    port: 5001,
    strictPort: true,
    cors: true,
  },

  build: {
    // Module Federation requires top-level await support
    target: 'esnext',
    minify: false,
    cssCodeSplit: false,
  },
});
