import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';

/**
 * Rsbuild + Module Federation 2.x configuration for the Network remote.
 *
 * Discovered by the host at runtime via public/remotes.manifest.json —
 * no build-time coupling. Mirrors packages/remote-notes/rsbuild.config.ts.
 *
 * @tanstack/react-query is intentionally NOT shared — it is remote-internal
 * state, so each remote keeps its own QueryClient. Only react/react-dom are
 * negotiated as singletons through the shared scope.
 */

// Absolute dev origin so the host (on :5173) can load chunks cross-origin
const DEV_ORIGIN = 'http://localhost:5003';

export default defineConfig({
  plugins: [
    pluginReact(),
    pluginModuleFederation({
      name: 'remoteNetwork',
      filename: 'remoteEntry.js',
      exposes: {
        './NetworkApp': './src/NetworkApp.tsx',
      },
      shared: {
        react: { singleton: true, requiredVersion: '^19.0.0' },
        'react-dom': { singleton: true, requiredVersion: '^19.0.0' },
      },
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
    port: 5003,
    strictPort: true,
    cors: { origin: '*' },
  },
  dev: {
    assetPrefix: DEV_ORIGIN,
  },
  output: {
    assetPrefix: process.env.ASSET_PREFIX || 'auto',
  },
});
