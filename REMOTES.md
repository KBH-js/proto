# Remote Micro-Frontend Architecture

This document describes the Module Federation architecture used to integrate remote micro-frontend applications into the Proto OS host.

## Overview

The Proto OS uses **Module Federation** (via `@originjs/vite-plugin-federation`) to load remote applications at runtime. This enables:

- **Independent deployability**: Remotes can be updated without redeploying the host
- **Team autonomy**: Different teams can own different micro-frontends
- **Technology flexibility**: Remotes could use different versions or even different frameworks (with limitations)
- **Graceful degradation**: Host continues working if a remote is unavailable

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Host (Proto OS)                         │
│                    http://localhost:5173                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  WindowManager  │  Desktop  │  Taskbar  │  ...      │   │
│  └─────────────────────────────────────────────────────┘   │
│                           │                                 │
│            ┌──────────────┼──────────────┐                 │
│            ▼              ▼              ▼                 │
│     ┌──────────┐   ┌──────────┐   ┌──────────┐            │
│     │ Local    │   │ Remote   │   │ Remote   │            │
│     │ Apps     │   │ Loader   │   │ Loader   │            │
│     │ (About,  │   │ (Lazy)   │   │ (Lazy)   │            │
│     │ Settings)│   └────┬─────┘   └────┬─────┘            │
│     └──────────┘        │              │                   │
└─────────────────────────┼──────────────┼───────────────────┘
                          │              │
                          ▼              ▼
              ┌───────────────┐  ┌───────────────┐
              │ Calculator    │  │ Future Remote │
              │ Remote        │  │               │
              │ :5001         │  │ :5002         │
              └───────────────┘  └───────────────┘
```

## Quick Start

### Development Environment

**Important**: Module Federation with `@originjs/vite-plugin-federation` requires remotes to be **built and served in preview mode**, not dev mode.

#### 1. Start the Remote (first)

```bash
cd packages/remote-calculator
pnpm build && pnpm preview
```

This builds the remote and serves it at `http://localhost:5001`.

#### 2. Start the Host (second)

```bash
# In the repo root
pnpm dev
```

Host starts at `http://localhost:5173`.

#### 3. Access the Application

Open `http://localhost:5173` in your browser. Click the Calculator icon on the desktop to load the remote micro-frontend.

### Startup Order

| Order | Application | Command | URL |
|-------|-------------|---------|-----|
| 1 | Remote Calculator | `pnpm build && pnpm preview` | http://localhost:5001 |
| 2 | Host OS | `pnpm dev` | http://localhost:5173 |

> **Note**: The remote must be running before the host attempts to load it. If the remote is unavailable, the host will display an error boundary.

## Creating a New Remote App

### Step 1: Create Package Directory

```bash
mkdir -p packages/remote-myapp
cd packages/remote-myapp
```

### Step 2: Initialize Package

```bash
pnpm init
```

### Step 3: Install Dependencies

```bash
pnpm add react react-dom
pnpm add -D vite @vitejs/plugin-react @originjs/vite-plugin-federation typescript @types/react @types/react-dom
```

### Step 4: Create vite.config.ts

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  plugins: [
    react(),
    federation({
      // Unique name for this remote (used by host to reference it)
      name: 'remoteMyApp',
      
      // The generated manifest file that host loads
      filename: 'remoteEntry.js',
      
      // Expose components for the host to consume
      // Format: { '<import-path>': '<file-path>' }
      exposes: {
        './MyAppComponent': './src/MyAppComponent.tsx',
      },
      
      // Shared dependencies - CRITICAL for React apps
      shared: {
        react: {
          singleton: true,           // Only one React instance
          requiredVersion: '^19.0.0', // Match host version
        },
        'react-dom': {
          singleton: true,
          requiredVersion: '^19.0.0',
        },
      },
    }),
  ],
  
  server: {
    port: 5002,          // Choose a unique port
    strictPort: true,
    cors: true,
  },
  
  preview: {
    port: 5002,
    strictPort: true,
    cors: true,
  },
  
  build: {
    target: 'esnext',    // Required for Module Federation
    minify: false,       // Easier debugging
    cssCodeSplit: false,
  },
});
```

### Step 5: Create Your Component

```typescript
// src/MyAppComponent.tsx
export default function MyAppComponent() {
  return (
    <div className="p-4">
      <h1>My Remote App</h1>
    </div>
  );
}
```

### Step 6: Add Package Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

## Registering a Remote in the Host

### Step 1: Add Remote to Host's vite.config.ts

```typescript
// vite.config.ts (host)
federation({
  name: 'host',
  remotes: {
    // Add your new remote here
    remoteMyApp: 'http://localhost:5002/assets/remoteEntry.js',
  },
  shared: {
    react: { singleton: true, requiredVersion: '^19.0.0' },
    'react-dom': { singleton: true, requiredVersion: '^19.0.0' },
  },
}),
```

### Step 2: Add TypeScript Declaration

Create or update `src/remotes.d.ts`:

```typescript
// src/remotes.d.ts
declare module 'remoteMyApp/MyAppComponent' {
  import { ComponentType } from 'react';
  const MyAppComponent: ComponentType;
  export default MyAppComponent;
}
```

### Step 3: Add to App Registry

```typescript
// src/registry/appRegistry.ts
import { lazy } from 'react';

const LazyMyApp = lazy(() => import('remoteMyApp/MyAppComponent'));

export const appRegistry: Record<string, AppRegistryEntry> = {
  // ... existing apps
  
  myapp: {
    component: LazyMyApp,
    defaultConfig: {
      componentType: 'myapp',
      title: 'My App',
      icon: '🚀',
      defaultSize: { w: 400, h: 300 },
    },
    isRemote: true,
  },
};
```

## Standalone vs Integration Mode

Remote apps can run in two modes:

### Integration Mode (Inside Host)

When loaded via Module Federation into the host:
- Receives `HostContext` with real host state
- Shares React instance with host
- Styled consistently with host theme

### Standalone Mode (Independent Development)

When running `pnpm dev` directly in the remote package:
- Uses `MockHostProvider` for simulated host context
- Has its own React instance
- Useful for rapid development and testing

### Implementing Standalone Mode

1. Create a `MockHostProvider`:

```typescript
// src/MockHostProvider.tsx
import { createContext, useContext, ReactNode } from 'react';

export interface HostContextValue {
  theme: 'light' | 'dark';
  locale: string;
}

const defaultValues: HostContextValue = {
  theme: 'dark',
  locale: 'en',
};

const MockHostContext = createContext<HostContextValue | null>(null);

export function useMockHostContext(): HostContextValue {
  const context = useContext(MockHostContext);
  return context ?? defaultValues;
}

export function MockHostProvider({ children }: { children: ReactNode }) {
  return (
    <MockHostContext.Provider value={defaultValues}>
      {children}
    </MockHostContext.Provider>
  );
}
```

2. Create an `App.tsx` for standalone entry:

```typescript
// src/App.tsx
import { MockHostProvider } from './MockHostProvider';
import MyAppComponent from './MyAppComponent';

export default function App() {
  return (
    <MockHostProvider>
      <MyAppComponent />
    </MockHostProvider>
  );
}
```

3. Create `main.tsx` that renders standalone app:

```typescript
// src/main.tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

## Host-Remote Communication

### Read-Only State Access (HostContext)

The host provides a `HostContext` that remotes can consume:

```typescript
// In remote component
import { useHostContext } from '../context/HostContext';

function MyRemoteComponent() {
  const { theme, locale } = useHostContext();
  
  return (
    <div className={theme === 'dark' ? 'bg-gray-800' : 'bg-white'}>
      Current locale: {locale}
    </div>
  );
}
```

The `useHostContext` hook gracefully falls back to defaults if running outside the host.

### Bidirectional Communication (Custom Events API)

For remotes to communicate back to the host, use the Custom Events API:

#### Host → Remote (Broadcast)

```typescript
// Host dispatches
window.dispatchEvent(new CustomEvent('host:theme-changed', {
  detail: { theme: 'dark' }
}));

// Remote listens
useEffect(() => {
  const handler = (e: CustomEvent) => {
    console.log('Theme changed to:', e.detail.theme);
  };
  window.addEventListener('host:theme-changed', handler);
  return () => window.removeEventListener('host:theme-changed', handler);
}, []);
```

#### Remote → Host (Request)

```typescript
// Remote dispatches
window.dispatchEvent(new CustomEvent('remote:request-fullscreen', {
  detail: { windowId: 'myapp-1' }
}));

// Host listens
useEffect(() => {
  const handler = (e: CustomEvent) => {
    maximizeWindow(e.detail.windowId);
  };
  window.addEventListener('remote:request-fullscreen', handler);
  return () => window.removeEventListener('remote:request-fullscreen', handler);
}, []);
```

#### Event Naming Convention

| Prefix | Direction | Example |
|--------|-----------|---------|
| `host:*` | Host → Remote | `host:theme-changed`, `host:locale-changed` |
| `remote:*` | Remote → Host | `remote:request-fullscreen`, `remote:close-window` |

## Troubleshooting

### "Failed to fetch dynamically imported module"

**Cause**: The remote server is not running or not accessible.

**Solutions**:
1. Ensure the remote is running: `pnpm build && pnpm preview`
2. Check the port is correct in host's `vite.config.ts`
3. Check for CORS issues (remote should have `cors: true`)

### "Multiple React instances" Error

**Cause**: React is being bundled separately in host and remote.

**Solution**: Ensure both host and remote have matching `shared` configuration:

```typescript
shared: {
  react: { singleton: true, requiredVersion: '^19.0.0' },
  'react-dom': { singleton: true, requiredVersion: '^19.0.0' },
}
```

### Retry After Failure Doesn't Work

**Cause**: This is a known limitation of Module Federation. The browser and federation runtime cache failed requests.

**Solution**: Refresh the entire page to retry loading failed remotes. The "Close Window" button in the error boundary allows users to close the failed window without affecting other open windows.

### Remote Works in Standalone but Not in Host

**Possible causes**:
1. **Missing TypeScript declaration** - Add module declaration to `src/remotes.d.ts`
2. **Different React versions** - Ensure `requiredVersion` matches
3. **Build not updated** - Rebuild the remote: `pnpm build && pnpm preview`

### Changes Not Reflecting

**For remotes**: Module Federation requires a production build. After making changes:

```bash
cd packages/remote-myapp
pnpm build && pnpm preview
```

Then refresh the host page.

### Port Already in Use

```bash
# Find process using the port
netstat -ano | findstr :5001

# Kill the process (Windows)
taskkill /PID <PID> /F

# Kill the process (macOS/Linux)
kill -9 <PID>
```

## Shared Theme Tokens

To ensure consistent styling across host and remotes, use the shared theme package:

```typescript
// In remote's tailwind.config.js
import theme from '@proto/shared/theme';

export default {
  theme: {
    extend: {
      colors: theme.colors,
      spacing: theme.spacing,
      // ... other theme tokens
    },
  },
};
```

The `@proto/shared` package (`packages/shared`) exports design tokens for:
- Colors (background, text, accent)
- Spacing
- Border radius
- Font families and sizes
- Box shadows
- Z-index values
- Transitions
