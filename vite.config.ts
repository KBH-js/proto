import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  const REMOTE_CALCULATOR_URL = env.VITE_REMOTE_CALCULATOR_URL
    || 'http://localhost:5001/assets/remoteEntry.js';

  return {
    plugins: [
      react({
        babel: {
          plugins: ['babel-plugin-react-compiler'],
        },
      }),
      federation({
        name: 'host',
        remotes: {
          remoteCalculator: REMOTE_CALCULATOR_URL,
        },
        shared: {
          // Singleton to prevent "multiple React instances"; the host
          // generates the shared modules that remotes consume.
          react: {
            singleton: true,
            requiredVersion: '^19.0.0',
            generate: true,
          },
          'react-dom': {
            singleton: true,
            requiredVersion: '^19.0.0',
            generate: true,
          },
        },
      }),
    ],

    build: {
      // Module Federation requires top-level await support
      target: 'esnext',
      modulePreload: false,
      minify: false,
      cssCodeSplit: false,
    },

    define: {
      __REMOTE_CALCULATOR_URL__: JSON.stringify(REMOTE_CALCULATOR_URL),
    },
  };
});
