# PRD: Micro-Frontend Architecture with Module Federation

## 1. Introduction/Overview

The current Window Manager is a monolithic Vite + React application where all apps (Placeholder, About, Settings) are bundled as local components. This architecture limits scalability, independent deployability, and team autonomy.

This feature refactors the Window Manager into a **Micro-Frontend Architecture** using **Module Federation**. Remote applications will be developed, built, and deployed independently while being consumed dynamically by the Host (the main OS shell). This enables:

- Independent development and deployment of apps
- Reduced bundle size for the host application
- Fault isolation (a broken remote doesn't crash the entire OS)
- A scalable pattern for adding new apps without modifying the host

## 2. Goals

1. **Establish Module Federation infrastructure** using `@originjs/vite-plugin-federation` compatible with the current Vite 6 + React 19 setup
2. **Create a reusable remote app template** that serves as the pattern for all future remote applications
3. **Implement a Calculator remote app** as the proof-of-concept demonstrating the architecture
4. **Refactor the app registry** to support dynamic imports via `React.lazy` and `Suspense`
5. **Ensure graceful degradation** when remote apps are unavailable
6. **Configure shared dependencies** (React, ReactDOM) to prevent duplicate instance errors
7. **Document the pattern** so developers can easily add new remote apps

## 3. User Stories

### US-1: Developer Adding a New Remote App
> As a developer, I want a clear template and documentation for creating remote apps, so that I can add new micro-frontends without deep knowledge of Module Federation configuration.

### US-2: User Launching a Remote App
> As a user, I want to double-click the Calculator icon on the desktop and have it open in a window, so that I can use the app seamlessly regardless of whether it's a local or remote component.

### US-3: User Experiencing Remote Failure
> As a user, when a remote app fails to load (e.g., server is down), I want to see a helpful error message with a retry button inside the window, so that I understand what happened and can try again.

### US-4: Developer Running the Dev Environment
> As a developer, I want to run the host and remote apps in separate terminals, so that I have full control over each process and can restart them independently.

### US-5: Host Resilience
> As a user, I want the OS to remain fully functional even if a remote app server goes offline, so that I can continue using other apps without interruption.

## 4. Functional Requirements

### 4.1 Project Structure & Monorepo Setup

1. **FR-1.1**: Configure pnpm workspaces at the repository root with a `pnpm-workspace.yaml` file
2. **FR-1.2**: Create a `/packages` directory to house all remote applications
3. **FR-1.3**: Move/keep the host application at the root level (current location)
4. **FR-1.4**: Create a remote app template structure at `/packages/remote-calculator`

### 4.2 Remote App Configuration (Calculator)

5. **FR-2.1**: Initialize `/packages/remote-calculator` as a separate Vite + React + TypeScript project
6. **FR-2.2**: Install and configure `@originjs/vite-plugin-federation` in the remote's `vite.config.ts`
7. **FR-2.3**: Configure the remote to expose `./CalculatorApp` as a federated module
8. **FR-2.4**: Configure shared dependencies: `react` and `react-dom` as singletons with `requiredVersion` matching the host
9. **FR-2.5**: Set the remote's dev server to run on a distinct port (e.g., `5001`)
10. **FR-2.6**: Create a `CalculatorApp` component with basic calculator functionality (display, number buttons 0-9, basic operations +, -, ×, ÷, =, clear)
11. **FR-2.7**: The remote must be buildable and servable independently (`pnpm dev`, `pnpm build`, `pnpm preview`)

### 4.3 Host App Configuration

12. **FR-3.1**: Install `@originjs/vite-plugin-federation` in the host (root) application
13. **FR-3.2**: Configure the host's `vite.config.ts` to consume the remote with a named remote entry (e.g., `remoteCalculator`)
14. **FR-3.3**: Configure shared dependencies in the host matching the remote configuration
15. **FR-3.4**: Add TypeScript module declaration for the remote (`remoteCalculator/CalculatorApp`)
16. **FR-3.5**: The host dev server remains on port `5173` (default)

### 4.4 App Registry Refactoring

17. **FR-4.1**: Refactor `src/registry/appRegistry.ts` to support both static and dynamic (lazy-loaded) components
18. **FR-4.2**: Create a lazy wrapper using `React.lazy()` for remote components
19. **FR-4.3**: Add the Calculator app to the registry with `componentType: 'calculator'`
20. **FR-4.4**: Update `AppRegistryEntry` interface to support async/lazy components
21. **FR-4.5**: Implement a `Suspense` boundary in `WindowFrame.tsx` (or appropriate parent) with a loading fallback

### 4.5 Error Handling & Resilience

22. **FR-5.1**: Create an `ErrorBoundary` component that catches remote loading failures
23. **FR-5.2**: The error UI must display inside the window frame (not crash the entire app)
24. **FR-5.3**: The error UI must show:
    - An error icon or illustration
    - A message explaining the app failed to load (e.g., "Calculator is currently unavailable")
    - A "Retry" button that attempts to reload the component
25. **FR-5.4**: The host application must remain fully functional when a remote is offline (other windows, taskbar, desktop icons all work normally)
26. **FR-5.5**: Desktop icons for unavailable remotes should still be clickable (error shown after click, not before)

### 4.6 Development Environment

27. **FR-6.1**: Each package must have its own `package.json` with `dev`, `build`, and `preview` scripts
28. **FR-6.2**: Document the startup order: remote first, then host
29. **FR-6.3**: The host must work (with error states for remotes) even if remotes are not running

### 4.7 Shared Styling

30. **FR-7.1**: Create a shared theme tokens file (e.g., `packages/shared/theme.js` or CSS custom properties in host's `index.css`)
31. **FR-7.2**: Theme tokens must include: color palette, spacing scale, border radii, and font settings
32. **FR-7.3**: Each remote must include its own Tailwind config that imports/references the shared theme tokens
33. **FR-7.4**: Remotes must visually match the host's design system when rendered

### 4.8 Host-Remote Communication

34. **FR-8.1**: Create a `HostContext` React Context in the host that exposes read-only host state (theme mode, locale, etc.)
35. **FR-8.2**: Wrap remote components with the `HostContext.Provider` so remotes can consume host state
36. **FR-8.3**: Document the Custom Events API for bidirectional communication (event names, payload shapes)
37. **FR-8.4**: Remotes must not crash if `HostContext` is unavailable (graceful fallback to defaults)

### 4.9 Remote Standalone Mode

38. **FR-9.1**: Each remote must have a standalone entry point (`main.tsx`) that renders the app independently
39. **FR-9.2**: Create a `MockHostProvider` component that remotes use in standalone mode to simulate host context
40. **FR-9.3**: The remote's `pnpm dev` command must launch the app in standalone mode (full page, not just the component)
41. **FR-9.4**: Document how to run remotes in standalone vs. integration mode

### 4.10 Documentation

42. **FR-10.1**: Create a `REMOTES.md` (or section in README) documenting:
    - How to create a new remote app (step-by-step)
    - Required vite.config.ts configuration
    - How to register the remote in the host
    - How to add the app to the registry
    - Standalone vs. integration mode
    - Host-remote communication patterns
43. **FR-10.2**: Add inline code comments in key configuration files explaining Module Federation settings

## 5. Non-Goals (Out of Scope)

1. **Production deployment configuration** - This PRD focuses on local development; CI/CD and production hosting are out of scope
2. **Migrating existing apps to remotes** - Existing apps (Placeholder, About, Settings) will remain local components
3. **Runtime remote discovery** - Remotes are statically configured; dynamic remote registration at runtime is not included
4. **Authentication/authorization between host and remotes** - No security layer for remote loading
5. **Versioning strategy for remotes** - Semantic versioning and compatibility checking are not covered
6. **Server-side rendering (SSR)** - The architecture remains client-side only
7. **Shared state between host and remotes** - Each remote is self-contained; cross-app state sharing is not implemented

## 6. Design Considerations

### 6.1 Error State UI

When a remote fails to load, the window frame remains intact with the following content:

```
┌─────────────────────────────────────┐
│ ● ● ●   Calculator                  │
├─────────────────────────────────────┤
│                                     │
│         ⚠️ (warning icon)           │
│                                     │
│   "Calculator is currently          │
│    unavailable"                     │
│                                     │
│   "The remote application could     │
│    not be loaded. Please ensure     │
│    the service is running."         │
│                                     │
│        [ 🔄 Retry ]                 │
│                                     │
└─────────────────────────────────────┘
```

### 6.2 Loading State UI

While a remote is loading, show a centered spinner or skeleton inside the window frame.

### 6.3 Calculator App UI

A simple calculator with:
- Display showing current input/result
- Number pad (0-9, decimal point)
- Operation buttons (+, -, ×, ÷)
- Equals (=) and Clear (C) buttons
- Styled consistently with the OS theme (Tailwind, similar colors/borders)

## 7. Technical Considerations

### 7.1 Module Federation Plugin

Use `@originjs/vite-plugin-federation` as it's the most mature Module Federation solution for Vite. Key configuration points:

**Remote (vite.config.ts):**
```typescript
federation({
  name: 'remoteCalculator',
  filename: 'remoteEntry.js',
  exposes: {
    './CalculatorApp': './src/CalculatorApp.tsx',
  },
  shared: ['react', 'react-dom'],
})
```

**Host (vite.config.ts):**
```typescript
federation({
  name: 'host',
  remotes: {
    remoteCalculator: 'http://localhost:5001/assets/remoteEntry.js',
  },
  shared: ['react', 'react-dom'],
})
```

### 7.2 Shared Dependencies

React and ReactDOM **must** be configured as shared singletons to prevent the "multiple React instances" error. Both host and remote must specify the same version constraints.

### 7.3 TypeScript Support

Create a type declaration file (`src/remotes.d.ts` or similar):

```typescript
declare module 'remoteCalculator/CalculatorApp' {
  const CalculatorApp: React.ComponentType;
  export default CalculatorApp;
}
```

### 7.4 Build Order

For production builds:
1. Build remotes first
2. Build host (which references remote entry points)

For development:
1. Start remote dev server(s)
2. Start host dev server

### 7.5 Folder Structure (Final State)

```
/proto
├── packages/
│   ├── shared/                       # Shared theme/utilities
│   │   ├── theme.js                  # Shared Tailwind theme tokens
│   │   └── package.json
│   └── remote-calculator/
│       ├── src/
│       │   ├── CalculatorApp.tsx     # Exposed component
│       │   ├── main.tsx              # Standalone mode entry
│       │   ├── MockHostProvider.tsx  # Mock context for standalone
│       │   └── App.tsx               # Standalone wrapper
│       ├── index.html                # Standalone HTML
│       ├── package.json
│       ├── vite.config.ts
│       ├── tailwind.config.js        # Imports shared theme
│       └── tsconfig.json
├── src/                              # Host app source
│   ├── context/
│   │   └── HostContext.tsx           # NEW: Host context provider
│   ├── registry/
│   │   └── appRegistry.ts            # Updated with lazy imports
│   ├── components/
│   │   ├── shared/
│   │   │   └── ErrorBoundary.tsx     # NEW: Remote error boundary
│   │   └── organisms/
│   │       └── WindowFrame.tsx       # With Suspense/ErrorBoundary
│   ├── remotes.d.ts                  # NEW: Remote type declarations
│   └── ...
├── pnpm-workspace.yaml               # NEW: Workspace config
├── REMOTES.md                        # NEW: Remote documentation
├── package.json                      # Host package.json
├── vite.config.ts                    # Updated with federation
└── ...
```

## 8. Success Metrics

| Metric | Target |
|--------|--------|
| Calculator remote loads in host window | ✅ Works |
| No "multiple React instances" console errors | ✅ Zero errors |
| Host remains functional when remote server is stopped | ✅ No crashes |
| Error boundary displays retry UI when remote is offline | ✅ Shows UI with retry button |
| Retry button successfully reloads component when remote comes back online | ✅ Works |
| Clear documentation exists for adding new remotes | ✅ REMOTES.md created |
| Both host and remote have independent dev/build scripts | ✅ Scripts exist |
| Remote styling matches host design system | ✅ Consistent look and feel |
| Remote can access host context (e.g., theme) | ✅ Context consumption works |
| Remote runs in standalone mode with `pnpm dev` | ✅ Full-page app renders |
| Remote gracefully handles missing host context | ✅ Falls back to defaults |

## 9. Resolved Questions

1. **Styling consistency**: Each remote includes its own Tailwind config with shared theme tokens (e.g., a shared `theme.js` or CSS custom properties that both host and remotes reference for colors, spacing, etc.)

2. **State sharing**: Use **React Context** (exposed by host) for read-only access to host state (e.g., theme, window dimensions). Use **Custom Events** for bidirectional ping-pong communication between host and remotes.

3. **Remote versioning**: Cache invalidation is handled by refreshing the host—updated remotes will load on next host page refresh. No complex versioning strategy required for this phase.

4. **Testing strategy**: Remotes will be configurable to support both **standalone mode** (runs independently with mock host context for development/testing) and **integration mode** (runs within the host shell). This enables isolated testing and integrated E2E testing.

---

*Document generated: January 25, 2026*
*Feature: Micro-Frontend Architecture with Module Federation*
