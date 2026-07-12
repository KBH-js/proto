import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';

/**
 * Rsbuild + Module Federation 2.x configuration for the Calculator remote.
 *
 * The host does NOT declare this remote at build time. It discovers the
 * remote at runtime via public/remotes.manifest.json and registers it with
 * the MF runtime, pointing at this app's generated mf-manifest.json.
 *
 * Unlike the previous Vite setup, `rsbuild dev` serves a real MF container,
 * so the build+preview workflow is no longer required during development.
 */

// Absolute dev origin so the host (on :5173) can load chunks cross-origin
const DEV_ORIGIN = 'http://localhost:5001';

export default defineConfig({
  plugins: [
    pluginReact(),
    pluginModuleFederation({
      name: 'remoteCalculator',
      filename: 'remoteEntry.js',
      exposes: {
        './CalculatorApp': './src/CalculatorApp.tsx',
      },
      shared: {
        react: { singleton: true, requiredVersion: '^19.0.0' },
        'react-dom': { singleton: true, requiredVersion: '^19.0.0' },
      },
      // Skip DTS generation/consumption — host types the remote via loadRemoteComponent<T>
      dts: false,
    }),
  ],
  html: {
    template: './index.html',
  },
  source: {
    entry: { index: './src/main.tsx' },
  },
  server: {
    port: 5001,
    strictPort: true,
    // Host fetches mf-manifest.json / remoteEntry.js cross-origin in dev
    cors: { origin: '*' },
  },
  dev: {
    assetPrefix: DEV_ORIGIN,
  },
  output: {
    // Production: set ASSET_PREFIX to the deployed origin (e.g. https://remote-calculator.vercel.app/)
    // so chunk URLs in mf-manifest.json resolve absolutely for cross-origin consumers.
    assetPrefix: process.env.ASSET_PREFIX || 'auto',
  },
});
