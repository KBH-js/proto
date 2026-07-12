import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';

/**
 * Rsbuild + Module Federation 2.x configuration for the Notes remote.
 *
 * Discovered by the host at runtime via public/remotes.manifest.json —
 * no build-time coupling. See packages/remote-calculator/rsbuild.config.ts
 * for the reference setup this mirrors.
 */

// Absolute dev origin so the host (on :5173) can load chunks cross-origin
const DEV_ORIGIN = 'http://localhost:5002';

export default defineConfig({
  plugins: [
    pluginReact(),
    pluginModuleFederation({
      name: 'remoteNotes',
      filename: 'remoteEntry.js',
      exposes: {
        './NotesApp': './src/NotesApp.tsx',
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
    port: 5002,
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
