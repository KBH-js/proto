import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import noRawColors from './eslint-rules/no-raw-colors.js';
import noRawPx from './eslint-rules/no-raw-px.js';

export default tseslint.config(
  { ignores: ['dist', 'packages/*/dist', '.claude/worktrees', '**/mockServiceWorker.js'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      // Local design-token guardrails (eslint-rules/no-raw-colors.js, no-raw-px.js)
      local: { rules: { 'no-raw-colors': noRawColors, 'no-raw-px': noRawPx } },
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      'local/no-raw-colors': 'error',
      'local/no-raw-px': 'error',
    },
  },
  {
    // Devtools console banners use `%c` CSS strings with raw colors — not
    // product UI, so the token guardrail doesn't apply here.
    files: ['src/store/toastStore.ts'],
    rules: { 'local/no-raw-colors': 'off' },
  },
);
