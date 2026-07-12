import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginBabel } from '@rsbuild/plugin-babel';
import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';

/**
 * Rsbuild + Module Federation 2.x configuration for the Host (OS Shell).
 *
 * Note that there is NO `remotes` key here: remotes are not known at build
 * time. The MF plugin exists solely to create the federation runtime
 * instance and populate the shared scope (react/react-dom singletons).
 * Actual remotes are registered at runtime via `registerRemotes()` after
 * fetching public/remotes.manifest.json — see src/federation/.
 */
export default defineConfig({
  plugins: [
    // React Compiler runs via Babel, scoped to JSX/TSX app code only.
    // Must be registered BEFORE pluginReact (official Rsbuild recipe).
    pluginBabel({
      include: /\.(?:jsx|tsx)$/,
      exclude: /node_modules/,
      babelLoaderOptions(opts) {
        opts.plugins ??= [];
        opts.plugins.unshift('babel-plugin-react-compiler');
      },
    }),
    pluginReact(),
    pluginModuleFederation({
      name: 'host',
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
    // PORT override lets tooling run the host on a free port; the host
    // itself has no fixed-port requirement (remotes do — see packages/*)
    port: Number(process.env.PORT) || 5173,
    strictPort: true,
  },
});
