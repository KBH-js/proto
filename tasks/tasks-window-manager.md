## Relevant Files

- `src/types/window.types.ts` - TypeScript interfaces for WindowState, WindowStore, AppConfig
- `src/store/windowStore.ts` - Zustand store for global window state management
- `src/registry/appRegistry.ts` - Application registry mapping componentType to React components
- `src/components/atoms/Button.tsx` - Reusable button component
- `src/components/atoms/Icon.tsx` - Icon wrapper component
- `src/components/molecules/WindowControls.tsx` - macOS-style traffic light buttons (Close/Min/Max)
- `src/components/molecules/TaskbarItem.tsx` - Individual taskbar window item
- `src/components/molecules/DesktopIcon.tsx` - Desktop application icon
- `src/components/organisms/TitleBar.tsx` - Window title bar with controls and drag handle
- `src/components/organisms/WindowFrame.tsx` - Main window component with react-rnd
- `src/components/organisms/Taskbar.tsx` - Fixed bottom taskbar/dock
- `src/components/organisms/Desktop.tsx` - Desktop background with app icons
- `src/components/templates/WindowManagerLayout.tsx` - Main layout assembling all pieces
- `src/apps/PlaceholderApp.tsx` - Placeholder app component for testing windows
- `src/hooks/useWindowActions.ts` - Custom hook for window actions (optional helper)
- `src/App.tsx` - Root application component
- `src/main.tsx` - Application entry point
- `src/index.css` - Global styles and Tailwind imports
- `vite.config.ts` - Vite configuration with React Compiler
- `tailwind.config.js` - Tailwind CSS configuration
- `tsconfig.json` - TypeScript configuration
- `package.json` - Project dependencies

### Notes



## Instructions for Completing Tasks

**IMPORTANT:** As you complete each task, you must check it off in this markdown file by changing `- [ ]` to `- [x]`. This helps track progress and ensures you don't skip any steps.

Example:
- `- [ ] 1.1 Read file` → `- [x] 1.1 Read file` (after completing)

Update the file after completing each sub-task, not just after completing an entire parent task.

## Tasks

- [x] 0.0 Create feature branch
  - [x] 0.1 Create and checkout a new branch for this feature (`git checkout -b feature/window-manager`)

- [x] 1.0 Project Setup and Configuration
  - [x] 1.1 Initialize a new Vite project with React 19 and TypeScript
  - [x] 1.2 Install core dependencies: `zustand`, `react-rnd`, `uuid`, `@types/uuid`
  - [x] 1.3 Install Tailwind CSS and configure (`tailwindcss`, `postcss`, `autoprefixer`)
  - [x] 1.4 Install React Compiler: `babel-plugin-react-compiler`
  - [x] 1.5 Configure `vite.config.ts` with React Compiler babel plugin
  - [x] 1.6 Configure `tailwind.config.js` with content paths
  - [x] 1.7 Set up `src/index.css` with Tailwind directives (`@tailwind base/components/utilities`)
  - [x] 1.8 Create folder structure: `src/components/{atoms,molecules,organisms,templates}`, `src/store`, `src/registry`, `src/types`, `src/apps`, `src/hooks`, `src/utils`
  - [x] 1.9 Verify project runs with `pnpm dev`

- [x] 2.0 Define TypeScript Types and Interfaces
  - [x] 2.1 Create `src/types/window.types.ts`
  - [x] 2.2 Define `Position` interface with `x: number, y: number`
  - [x] 2.3 Define `Size` interface with `w: number, h: number`
  - [x] 2.4 Define `WindowState` interface with: `id`, `title`, `position`, `size`, `zIndex`, `isMinimized`, `isMaximized`, `componentType`, and optional `prevPosition`/`prevSize` for restore
  - [x] 2.5 Define `AppConfig` interface with: `componentType`, `title`, `icon`, `defaultSize?`, `minSize?`
  - [x] 2.6 Define `WindowStore` interface with state properties and all action method signatures
  - [x] 2.7 Export all types from the file

- [x] 3.0 Implement Zustand Window Store
  - [x] 3.1 Create `src/store/windowStore.ts`
  - [x] 3.2 Import types from `window.types.ts` and `uuid`
  - [x] 3.3 Implement `openWindow` action: creates new window with UUID, default size (50% viewport), centered position, assigns highest zIndex
  - [x] 3.4 Implement `closeWindow` action: removes window by ID from array
  - [x] 3.5 Implement `focusWindow` action: sets `activeWindowId` and updates zIndex to be highest
  - [x] 3.6 Implement `minimizeWindow` action: sets `isMinimized: true` for window
  - [x] 3.7 Implement `maximizeWindow` action: stores current position/size in `prevPosition`/`prevSize`, sets `isMaximized: true`, updates position to (0,0) and size to viewport (minus taskbar)
  - [x] 3.8 Implement `restoreWindow` action: restores from minimized OR maximized state using stored prev values
  - [x] 3.9 Implement `updateWindowPosition` action: updates window position by ID
  - [x] 3.10 Implement `updateWindowSize` action: updates window size by ID
  - [x] 3.11 Implement helper `getNextZIndex` to calculate highest zIndex + 1
  - [x] 3.12 Export the store hook (`useWindowStore`)

- [x] 4.0 Create App Registry System
  - [x] 4.1 Create `src/apps/PlaceholderApp.tsx` - a simple placeholder component displaying app name/info
  - [x] 4.2 Create `src/registry/appRegistry.ts`
  - [x] 4.3 Define `AppRegistryEntry` type with `component` and `defaultConfig` (title, icon, etc.)
  - [x] 4.4 Create `appRegistry` Map/Record mapping `componentType` strings to registry entries
  - [x] 4.5 Register placeholder app(s) in the registry (e.g., 'placeholder', 'about')
  - [x] 4.6 Export helper function `getApp(componentType: string)` to retrieve component from registry
  - [x] 4.7 Add JSDoc comments explaining how to add MFE apps in the future

- [x] 5.0 Build Atomic Components (Atoms & Molecules)
  - [x] 5.1 Create `src/components/atoms/Button.tsx` - generic button with variants (icon-only, with-text)
  - [x] 5.2 Create `src/components/atoms/Icon.tsx` - wrapper for rendering icons (can use inline SVGs or icon library)
  - [x] 5.3 Create `src/components/molecules/WindowControls.tsx` - macOS traffic light buttons (red close, yellow minimize, green maximize)
  - [x] 5.4 Style WindowControls: circular buttons ~12px, spacing, hover effects showing symbols (×, −, +)
  - [x] 5.5 Add onClick props to WindowControls for `onClose`, `onMinimize`, `onMaximize`
  - [x] 5.6 Create `src/components/molecules/TaskbarItem.tsx` - button showing window icon/title, active state indicator
  - [x] 5.7 Add props to TaskbarItem: `window`, `isActive`, `onClick`
  - [x] 5.8 Create `src/components/molecules/DesktopIcon.tsx` - icon + label, double-click handler
  - [x] 5.9 Add props to DesktopIcon: `icon`, `label`, `onDoubleClick`

- [x] 6.0 Build Window Frame with Drag/Resize (react-rnd)
  - [x] 6.1 Create `src/components/organisms/TitleBar.tsx`
  - [x] 6.2 TitleBar: render WindowControls on left, centered title text, apply drag handle class
  - [x] 6.3 TitleBar: style for active (bright) vs inactive (muted) states via prop
  - [x] 6.4 TitleBar: implement double-click on title bar to toggle maximize/restore
  - [x] 6.5 Create `src/components/organisms/WindowFrame.tsx`
  - [x] 6.6 WindowFrame: integrate `<Rnd>` component from react-rnd
  - [x] 6.7 WindowFrame: configure Rnd with `position`, `size`, `minWidth`/`minHeight` (200x150), `dragHandleClassName`
  - [x] 6.8 WindowFrame: implement `onDragStop` to update position in Zustand store
  - [x] 6.9 WindowFrame: implement `onResizeStop` to update size in Zustand store
  - [x] 6.10 WindowFrame: implement `onMouseDown` to call `focusWindow` (bring to front)
  - [x] 6.11 WindowFrame: apply dynamic `zIndex` from window state
  - [x] 6.12 WindowFrame: conditionally hide (display: none or return null) when `isMinimized`
  - [x] 6.13 WindowFrame: disable drag/resize when `isMaximized`
  - [x] 6.14 WindowFrame: render TitleBar and content area (children from app registry)
  - [x] 6.15 WindowFrame: dynamically resolve and render component from appRegistry based on `componentType`
  - [x] 6.16 WindowFrame: style with border/shadow, distinguish active vs inactive window

- [x] 7.0 Build Taskbar Component
  - [x] 7.1 Create `src/components/organisms/Taskbar.tsx`
  - [x] 7.2 Taskbar: fixed positioning at bottom, full width, ~48-56px height
  - [x] 7.3 Taskbar: set z-index higher than any window (e.g., 9999)
  - [x] 7.4 Taskbar: style with dark/semi-transparent background
  - [x] 7.5 Taskbar: subscribe to `windows` array from Zustand store
  - [x] 7.6 Taskbar: render TaskbarItem for each open window
  - [x] 7.7 Taskbar: pass `isActive` prop based on `activeWindowId`
  - [x] 7.8 Taskbar: implement click handler - if minimized: restore + focus; if visible: minimize

- [ ] 8.0 Build Desktop with App Launcher
  - [ ] 8.1 Create `src/components/organisms/Desktop.tsx`
  - [ ] 8.2 Desktop: full viewport size, positioned behind windows (low z-index)
  - [ ] 8.3 Desktop: apply background color or gradient
  - [ ] 8.4 Desktop: define array of available apps (from registry) to show as icons
  - [ ] 8.5 Desktop: render DesktopIcon for each available app
  - [ ] 8.6 Desktop: implement double-click handler that calls `openWindow` with app's componentType
  - [ ] 8.7 Desktop: position icons in a grid or vertical list on left side

- [ ] 9.0 Assemble Main Layout and Integration
  - [ ] 9.1 Create `src/components/templates/WindowManagerLayout.tsx`
  - [ ] 9.2 WindowManagerLayout: render Desktop as base layer
  - [ ] 9.3 WindowManagerLayout: subscribe to `windows` array from store
  - [ ] 9.4 WindowManagerLayout: map and render WindowFrame for each window in array
  - [ ] 9.5 WindowManagerLayout: render Taskbar as top layer
  - [ ] 9.6 Update `src/App.tsx` to render WindowManagerLayout
  - [ ] 9.7 Ensure viewport is 100vw/100vh with no scroll, overflow hidden
  - [ ] 9.8 Add minimum width check or message for viewports < 1024px (desktop only)
  - [ ] 9.9 Verify complete flow: double-click icon → window opens → drag/resize → minimize/maximize/restore → close
