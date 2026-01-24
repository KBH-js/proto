## Relevant Files

### New Files to Create

- `pnpm-workspace.yaml` - Workspace configuration defining packages location
- `packages/shared/package.json` - Shared package manifest
- `packages/shared/theme.js` - Shared Tailwind theme tokens (colors, spacing, radii, fonts)
- `packages/remote-calculator/package.json` - Remote calculator package manifest with dev/build/preview scripts
- `packages/remote-calculator/tsconfig.json` - TypeScript configuration for remote
- `packages/remote-calculator/vite.config.ts` - Vite configuration with Module Federation plugin
- `packages/remote-calculator/tailwind.config.js` - Tailwind config importing shared theme
- `packages/remote-calculator/postcss.config.js` - PostCSS configuration
- `packages/remote-calculator/index.html` - HTML entry for standalone mode
- `packages/remote-calculator/src/index.css` - Tailwind directives and styles
- `packages/remote-calculator/src/CalculatorApp.tsx` - Calculator component (exposed via federation)
- `packages/remote-calculator/src/App.tsx` - Standalone wrapper component
- `packages/remote-calculator/src/main.tsx` - Standalone mode entry point
- `packages/remote-calculator/src/MockHostProvider.tsx` - Mock host context for standalone mode
- `packages/remote-calculator/src/vite-env.d.ts` - Vite type declarations
- `src/context/HostContext.tsx` - Host context provider for remotes to consume
- `src/components/shared/ErrorBoundary.tsx` - Error boundary for catching remote load failures
- `src/components/shared/LoadingFallback.tsx` - Loading spinner/skeleton for Suspense
- `src/remotes.d.ts` - TypeScript module declarations for remote components
- `REMOTES.md` - Documentation for creating and managing remote apps

### Existing Files to Modify

- `vite.config.ts` - Add @originjs/vite-plugin-federation with host configuration
- `src/registry/appRegistry.ts` - Add lazy loading support and calculator entry
- `src/components/organisms/WindowFrame.tsx` - Wrap content with Suspense and ErrorBoundary
- `src/App.tsx` - Wrap with HostProvider
- `package.json` - May need to add workspace-level scripts

### Notes

- Remote must be started before host during development (port 5001 for remote, 5173 for host)
- Use `pnpm install` at root to install all workspace dependencies
- Run `pnpm dev` in `packages/remote-calculator` first, then `pnpm dev` in root
- The shared theme package does not need a build step; it exports plain JS objects

## Instructions for Completing Tasks

**IMPORTANT:** As you complete each task, you must check it off in this markdown file by changing `- [ ]` to `- [x]`. This helps track progress and ensures you don't skip any steps.

Example:
- `- [ ] 1.1 Read file` → `- [x] 1.1 Read file` (after completing)

Update the file after completing each sub-task, not just after completing an entire parent task.

## Tasks

- [x] 0.0 Create feature branch
  - [x] 0.1 Create and checkout a new branch for this feature (`git checkout -b feature/micro-frontend-architecture`)

- [x] 1.0 Monorepo & pnpm Workspace Setup
  - [x] 1.1 Create `pnpm-workspace.yaml` at repository root with `packages/*` glob
  - [x] 1.2 Create `/packages` directory
  - [x] 1.3 Verify host app structure remains at root level (no changes needed)
  - [x] 1.4 Run `pnpm install` to initialize workspace

- [x] 2.0 Create Shared Theme Package
  - [x] 2.1 Create `packages/shared` directory
  - [x] 2.2 Create `packages/shared/package.json` with name `@proto/shared`
  - [x] 2.3 Create `packages/shared/theme.js` exporting theme tokens
  - [x] 2.4 Include color palette (background, foreground, accent, error colors)
  - [x] 2.5 Include spacing scale, border radii, and font settings
  - [x] 2.6 Verify theme can be imported by other packages

- [x] 3.0 Initialize Remote Calculator Project
  - [x] 3.1 Create `packages/remote-calculator` directory
  - [x] 3.2 Create `package.json` with name `@proto/remote-calculator` and scripts (dev, build, preview)
  - [x] 3.3 Create `tsconfig.json` extending recommended TypeScript settings
  - [x] 3.4 Create `index.html` with root div for standalone mode
  - [x] 3.5 Install dependencies: `react`, `react-dom`
  - [x] 3.6 Install dev dependencies: `typescript`, `vite`, `@vitejs/plugin-react`, `@types/react`, `@types/react-dom`
  - [x] 3.7 Install Tailwind: `tailwindcss`, `postcss`, `autoprefixer`
  - [x] 3.8 Create `postcss.config.js` with Tailwind and Autoprefixer plugins
  - [x] 3.9 Create `tailwind.config.js` importing theme from `@proto/shared`
  - [x] 3.10 Create `src/index.css` with `@tailwind base/components/utilities` directives
  - [x] 3.11 Create `src/vite-env.d.ts` with Vite client types reference
  - [x] 3.12 Verify project structure is complete

- [x] 4.0 Configure Module Federation for Remote
  - [x] 4.1 Install `@originjs/vite-plugin-federation` in remote-calculator
  - [x] 4.2 Create `vite.config.ts` importing federation plugin and React plugin
  - [x] 4.3 Configure federation with `name: 'remoteCalculator'`
  - [x] 4.4 Set `filename: 'remoteEntry.js'`
  - [x] 4.5 Configure `exposes: { './CalculatorApp': './src/CalculatorApp.tsx' }`
  - [x] 4.6 Configure shared dependencies: `react` and `react-dom` as singletons
  - [x] 4.7 Set dev server port to `5001` in vite config
  - [x] 4.8 Set build target to `esnext` for top-level await support
  - [x] 4.9 Verify federation config is valid (no build errors)

- [x] 5.0 Implement Calculator App Component
  - [x] 5.1 Create `src/CalculatorApp.tsx` as a functional component
  - [x] 5.2 Define state: `display` (string), `previousValue` (number|null), `operation` (string|null), `waitingForOperand` (boolean)
  - [x] 5.3 Implement `inputDigit(digit)` function for number button clicks
  - [x] 5.4 Implement `inputDecimal()` function for decimal point
  - [x] 5.5 Implement `clearAll()` function for C button
  - [x] 5.6 Implement `performOperation(nextOperation)` for +, -, ×, ÷ buttons
  - [x] 5.7 Implement `calculate(left, right, op)` helper for actual math
  - [x] 5.8 Create display UI showing current value
  - [x] 5.9 Create number pad grid (7-8-9, 4-5-6, 1-2-3, 0-.)
  - [x] 5.10 Create operation buttons column (+, -, ×, ÷, =)
  - [x] 5.11 Create clear button (C)
  - [x] 5.12 Style using Tailwind with shared theme tokens (colors, rounded corners)
  - [x] 5.13 Ensure component handles division by zero gracefully
  - [x] 5.14 Export component as default export

- [ ] 6.0 Set Up Remote Standalone Mode
  - [ ] 6.1 Create `src/MockHostProvider.tsx` with hardcoded default context values
  - [ ] 6.2 Define mock values: `theme: 'dark'`, `locale: 'en'`
  - [ ] 6.3 Create `src/App.tsx` that wraps CalculatorApp with MockHostProvider
  - [ ] 6.4 Add basic page styling in App.tsx (centered, dark background)
  - [ ] 6.5 Create `src/main.tsx` that renders App into root element
  - [ ] 6.6 Import `index.css` in main.tsx
  - [ ] 6.7 Verify `pnpm dev` launches standalone calculator on port 5001
  - [ ] 6.8 Test calculator works in standalone mode

- [ ] 7.0 Configure Module Federation for Host
  - [ ] 7.1 Install `@originjs/vite-plugin-federation` in host (root package.json)
  - [ ] 7.2 Update `vite.config.ts` to import federation plugin
  - [ ] 7.3 Configure federation with `name: 'host'`
  - [ ] 7.4 Add remote: `remoteCalculator: 'http://localhost:5001/assets/remoteEntry.js'`
  - [ ] 7.5 Configure shared dependencies matching remote (react, react-dom as singletons)
  - [ ] 7.6 Set build target to `esnext` for top-level await support
  - [ ] 7.7 Create `src/remotes.d.ts` with module declaration for `remoteCalculator/CalculatorApp`
  - [ ] 7.8 Verify host compiles without TypeScript errors

- [ ] 8.0 Implement Host Context System
  - [ ] 8.1 Create `src/context` directory
  - [ ] 8.2 Create `src/context/HostContext.tsx`
  - [ ] 8.3 Define `HostContextValue` interface with `theme`, `locale` properties
  - [ ] 8.4 Create `HostContext` using `React.createContext<HostContextValue | null>(null)`
  - [ ] 8.5 Create `HostProvider` component that provides context values
  - [ ] 8.6 Create `useHostContext` hook with null check and fallback defaults
  - [ ] 8.7 Export `HostContext`, `HostProvider`, `useHostContext`, and `HostContextValue`
  - [ ] 8.8 Wrap root app component with `HostProvider` in `src/App.tsx`
  - [ ] 8.9 Add JSDoc comments documenting Custom Events API for future bidirectional communication

- [ ] 9.0 Create Error Boundary & Loading States
  - [ ] 9.1 Create `src/components/shared` directory
  - [ ] 9.2 Create `src/components/shared/ErrorBoundary.tsx` as class component
  - [ ] 9.3 Implement `state: { hasError: boolean, error: Error | null }`
  - [ ] 9.4 Implement `static getDerivedStateFromError(error)` returning `{ hasError: true, error }`
  - [ ] 9.5 Implement `componentDidCatch(error, info)` for logging
  - [ ] 9.6 Create error UI with warning icon (⚠️ or SVG)
  - [ ] 9.7 Display message: "[App Name] is currently unavailable"
  - [ ] 9.8 Display secondary text: "The remote application could not be loaded"
  - [ ] 9.9 Add "Retry" button that resets error state and re-renders children
  - [ ] 9.10 Implement retry by resetting state and using a key prop trick
  - [ ] 9.11 Accept `appName` prop for customizing error message
  - [ ] 9.12 Create `src/components/shared/LoadingFallback.tsx` component
  - [ ] 9.13 Implement centered spinner or pulsing skeleton UI
  - [ ] 9.14 Style both components with Tailwind matching host design

- [ ] 10.0 Refactor App Registry for Dynamic Imports
  - [ ] 10.1 Open `src/registry/appRegistry.ts`
  - [ ] 10.2 Update `AppRegistryEntry` interface: change `component` type to `ComponentType<unknown> | React.LazyExoticComponent<ComponentType<unknown>>`
  - [ ] 10.3 Add `isRemote?: boolean` flag to `AppRegistryEntry` interface
  - [ ] 10.4 Create lazy import for Calculator: `const LazyCalculatorApp = React.lazy(() => import('remoteCalculator/CalculatorApp'))`
  - [ ] 10.5 Add calculator entry to `appRegistry` with `componentType: 'calculator'`, `isRemote: true`
  - [ ] 10.6 Set calculator default config: `title: 'Calculator'`, `icon: '🧮'`, `defaultSize: { w: 320, h: 480 }`
  - [ ] 10.7 Open `src/components/organisms/WindowFrame.tsx`
  - [ ] 10.8 Import `Suspense` from React
  - [ ] 10.9 Import `ErrorBoundary` and `LoadingFallback` components
  - [ ] 10.10 Wrap app content rendering with `<ErrorBoundary appName={title}>`
  - [ ] 10.11 Inside ErrorBoundary, wrap with `<Suspense fallback={<LoadingFallback />}>`
  - [ ] 10.12 Verify local apps (Placeholder, About, Settings) still render correctly
  - [ ] 10.13 Verify Calculator appears in desktop icons

- [ ] 11.0 Integration Testing & Verification
  - [ ] 11.1 Open terminal 1: navigate to `packages/remote-calculator`, run `pnpm dev`
  - [ ] 11.2 Verify remote dev server starts on http://localhost:5001
  - [ ] 11.3 Open terminal 2: navigate to root, run `pnpm dev`
  - [ ] 11.4 Verify host dev server starts on http://localhost:5173
  - [ ] 11.5 Open browser to http://localhost:5173
  - [ ] 11.6 Double-click Calculator icon on desktop
  - [ ] 11.7 Verify Calculator window opens and loads remote component
  - [ ] 11.8 Test calculator functionality (numbers, operations, clear)
  - [ ] 11.9 Open browser console, verify NO "multiple React instances" errors
  - [ ] 11.10 Stop remote server (Ctrl+C in terminal 1)
  - [ ] 11.11 Refresh host page, click Calculator icon
  - [ ] 11.12 Verify error boundary displays with retry button
  - [ ] 11.13 Verify host remains functional (other apps work, taskbar works)
  - [ ] 11.14 Restart remote server
  - [ ] 11.15 Click "Retry" button in error UI
  - [ ] 11.16 Verify Calculator loads successfully after retry
  - [ ] 11.17 Test local apps (About, Settings) still work correctly
  - [ ] 11.18 Verify Calculator styling matches host design system

- [ ] 12.0 Create Documentation
  - [ ] 12.1 Create `REMOTES.md` at repository root
  - [ ] 12.2 Add "Overview" section explaining Module Federation architecture
  - [ ] 12.3 Add "Quick Start" section with dev environment startup steps
  - [ ] 12.4 Document startup order: remote first, then host
  - [ ] 12.5 Add "Creating a New Remote App" section with step-by-step guide
  - [ ] 12.6 Include template vite.config.ts for new remotes
  - [ ] 12.7 Document required shared dependencies configuration
  - [ ] 12.8 Add "Registering a Remote in the Host" section
  - [ ] 12.9 Document how to add TypeScript declarations for new remotes
  - [ ] 12.10 Document how to add remote app to appRegistry
  - [ ] 12.11 Add "Standalone vs Integration Mode" section
  - [ ] 12.12 Explain MockHostProvider usage for standalone development
  - [ ] 12.13 Add "Host-Remote Communication" section
  - [ ] 12.14 Document HostContext usage for read-only state access
  - [ ] 12.15 Document Custom Events API pattern for bidirectional communication
  - [ ] 12.16 Add "Troubleshooting" section with common issues and solutions
  - [ ] 12.17 Add inline comments to `packages/remote-calculator/vite.config.ts` explaining federation options
  - [ ] 12.18 Add inline comments to host `vite.config.ts` explaining remote configuration
  - [ ] 12.19 Review all documentation for completeness and accuracy
