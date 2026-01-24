# PRD: Web-based Window Manager System

## 1. Introduction/Overview

This document outlines the requirements for a **Web-based Window Manager System** — a browser-based desktop environment that mimics the window management experience of operating systems like macOS or Windows. The system will be built using React 18, TypeScript, Tailwind CSS, and Zustand for state management.

### Problem Statement

Modern web applications often need to display multiple interactive panels, tools, or documents simultaneously. A window manager provides a familiar, intuitive paradigm for users to organize and interact with multiple application instances within a single browser viewport.

### Goal

Build a working prototype that demonstrates core window management interactions (drag, resize, focus, minimize/maximize) with a clean, extensible architecture suitable for future Module Federation (MFE) integration.

---

## 2. Goals

1. **Functional Window Management**: Implement draggable, resizable windows with proper focus (z-index) management.
2. **Familiar UX Paradigm**: Provide a desktop-like experience with a taskbar/dock and app launcher.
3. **Performance**: Ensure smooth interactions without unnecessary re-renders during drag/resize operations.
4. **Extensible Architecture**: Structure the codebase to support future Module Federation integration with decoupled app components.
5. **Type Safety**: Maintain strict TypeScript typing throughout the codebase.
6. **Component-Driven Design**: Follow atomic design principles for reusable, maintainable components.

---

## 3. User Stories

### US-1: Open a New Window
> As a user, I want to double-click an icon on the desktop so that a new window opens with the associated application.

### US-2: Drag a Window
> As a user, I want to drag a window by its title bar so that I can reposition it anywhere on the screen.

### US-3: Resize a Window
> As a user, I want to drag the edges or corners of a window so that I can resize it to my preferred dimensions.

### US-4: Focus a Window
> As a user, I want to click on a window so that it comes to the front (gains focus) and becomes the active window.

### US-5: Minimize a Window
> As a user, I want to click the minimize button so that the window hides and appears only in the taskbar.

### US-6: Maximize a Window
> As a user, I want to click the maximize button so that the window expands to fill the entire viewport (excluding the taskbar).

### US-7: Restore a Window
> As a user, I want to click a maximized window's maximize button again (or double-click the title bar) so that it returns to its previous size and position.

### US-8: Close a Window
> As a user, I want to click the close button so that the window is removed from the screen and taskbar.

### US-9: Use the Taskbar
> As a user, I want to see all open windows in the taskbar and click on them to toggle between minimized and restored states.

### US-10: Identify Active Window
> As a user, I want visual feedback (e.g., highlighted title bar, taskbar indicator) so that I can identify which window is currently active.

---

## 4. Functional Requirements

### 4.1 Window Frame Component

| ID | Requirement |
|----|-------------|
| FR-1.1 | The system must provide a generic `WindowFrame` component that wraps any application content. |
| FR-1.2 | The `WindowFrame` must contain a **Title Bar** with the window title, and Close, Minimize, and Maximize buttons. |
| FR-1.3 | The `WindowFrame` must contain a **Content Area** that renders the child application component. |
| FR-1.4 | The Title Bar buttons must trigger the appropriate window state changes (close, minimize, maximize/restore). |
| FR-1.5 | The `WindowFrame` must accept props for initial position, size, title, and the component to render. |
| FR-1.6 | Default window size must be 50% of viewport width and 50% of viewport height. |
| FR-1.7 | Default window position must be centered on the screen. |
| FR-1.8 | Window IDs must be generated using `uuid`. |

### 4.2 Window Dragging

| ID | Requirement |
|----|-------------|
| FR-2.1 | Users must be able to drag windows by clicking and holding the Title Bar. |
| FR-2.2 | Dragging must update the window's position in real-time. |
| FR-2.3 | Windows may be dragged partially outside the viewport (free movement). |
| FR-2.4 | Dragging must not trigger unnecessary re-renders of other windows or components. |

### 4.3 Window Resizing

| ID | Requirement |
|----|-------------|
| FR-3.1 | Users must be able to resize windows by dragging the edges (top, bottom, left, right) or corners. |
| FR-3.2 | Resizing must update the window's dimensions in real-time. |
| FR-3.3 | Windows must have a configurable minimum size (default: 200x150 pixels). |
| FR-3.4 | Windows may optionally have a maximum size constraint. |
| FR-3.5 | The resize cursor must change appropriately when hovering over resize handles. |

### 4.4 Focus Management (Z-Index)

| ID | Requirement |
|----|-------------|
| FR-4.1 | Clicking anywhere on a window (title bar or content) must bring it to the front. |
| FR-4.2 | The focused window must have the highest z-index among all open windows. |
| FR-4.3 | The system must track which window is currently active via `activeWindowId` in the global store. |
| FR-4.4 | The active window must have distinct visual styling (e.g., brighter title bar, shadow). |
| FR-4.5 | Starting a drag or resize operation on a window must also bring it to focus. |

### 4.5 Window States (Minimize/Maximize)

| ID | Requirement |
|----|-------------|
| FR-5.1 | Clicking the **Minimize** button must hide the window from view but keep it in the taskbar. |
| FR-5.2 | Clicking the **Maximize** button must expand the window to fill the available viewport (excluding the taskbar). |
| FR-5.3 | Clicking the **Maximize** button on a maximized window must restore it to its previous size and position. |
| FR-5.4 | The system must store the pre-maximized position and size to enable restoration. |
| FR-5.5 | Maximized windows must not be draggable or resizable (locked in place). |
| FR-5.6 | Double-clicking the Title Bar should toggle maximize/restore state. |

### 4.6 Global State Management (Zustand)

| ID | Requirement |
|----|-------------|
| FR-6.1 | The system must use Zustand for global window state management. |
| FR-6.2 | The store must track an array of window objects with the following properties: `id`, `title`, `position: {x, y}`, `size: {w, h}`, `zIndex`, `isMinimized`, `isMaximized`, `componentType`. |
| FR-6.3 | The store must track `activeWindowId` representing the currently focused window. |
| FR-6.4 | The store must provide actions: `openWindow`, `closeWindow`, `focusWindow`, `minimizeWindow`, `maximizeWindow`, `restoreWindow`, `updateWindowPosition`, `updateWindowSize`. |
| FR-6.5 | State updates during drag/resize should be optimized (e.g., throttled or using refs) to prevent performance degradation. |

### 4.7 Taskbar / Dock

| ID | Requirement |
|----|-------------|
| FR-7.1 | The system must display a fixed taskbar at the bottom of the viewport. |
| FR-7.2 | The taskbar must show an icon/button for each open window. |
| FR-7.3 | Clicking a taskbar item for a minimized window must restore and focus that window. |
| FR-7.4 | Clicking a taskbar item for a visible window must minimize it. |
| FR-7.5 | The taskbar must visually indicate which window is currently active. |
| FR-7.6 | The taskbar must remain visible above all windows (highest z-index layer). |

### 4.8 App Launcher / Desktop

| ID | Requirement |
|----|-------------|
| FR-8.1 | The system must display a desktop background area behind all windows. |
| FR-8.2 | The desktop must display application icons that can launch windows. |
| FR-8.3 | Double-clicking a desktop icon must open a new window instance with the associated application. |
| FR-8.4 | Desktop icons must be configurable (icon image, label, associated component type). |

### 4.9 Application Registry (MFE Preparation)

| ID | Requirement |
|----|-------------|
| FR-9.1 | Applications must be registered in a central registry (e.g., `appRegistry` map). |
| FR-9.2 | The registry must map `componentType` strings to React components. |
| FR-9.3 | The `WindowFrame` must dynamically resolve and render components from the registry. |
| FR-9.4 | The architecture must support future replacement of static imports with dynamic imports or Module Federation remotes. |

---

## 5. Non-Goals (Out of Scope)

The following items are explicitly **out of scope** for this PRD:

1. **Pre-built Applications**: No functional apps (calculator, file browser, etc.) will be included. Only placeholder/demo components for testing.
2. **State Persistence**: Window state will not persist across browser sessions (no localStorage).
3. **Mobile/Responsive Support**: The system targets desktop only (min-width ~1024px). No tablet or mobile layouts.
4. **Window Snapping**: No snap-to-edge or snap-assist functionality.
5. **Keyboard Shortcuts**: No keyboard navigation or shortcuts (Alt+Tab, etc.).
6. **Multi-Monitor Support**: Single viewport only.
7. **Themes/Dark Mode**: No theming system (can use a single consistent style).
8. **Animations**: Basic transitions only; no complex animations required.
9. **Right-Click Context Menus**: No context menus on desktop or windows.
10. **Window Grouping/Tabs**: No tabbed windows or window grouping.

---

## 6. Design Considerations

### Visual Style

- **Title Bar**: ~32-40px height, macOS-style with traffic light buttons on the left, window title centered.
- **Control Buttons**: macOS-style traffic lights — Close (red, left), Minimize (yellow, middle), Maximize (green, right).
- **Default Window Size**: 50% of viewport width and height, centered on screen.
- **Window Border**: Subtle border or shadow to distinguish windows from the desktop.
- **Active Window**: Visually distinct (brighter title bar, stronger shadow).
- **Inactive Window**: Muted/grayed title bar.
- **Taskbar**: ~48-56px height, fixed at bottom, dark or semi-transparent background.
- **Desktop**: Simple solid color or gradient background.

### Component Architecture (Atomic Design)

```
atoms/
  - Button
  - Icon
  - Typography

molecules/
  - WindowControls (Close/Min/Max buttons)
  - TaskbarItem
  - DesktopIcon

organisms/
  - TitleBar
  - WindowFrame
  - Taskbar
  - Desktop

templates/
  - WindowManagerLayout

pages/
  - App (root)
```

### Folder Structure (Suggested)

```
src/
├── components/
│   ├── atoms/
│   ├── molecules/
│   ├── organisms/
│   └── templates/
├── store/
│   └── windowStore.ts
├── registry/
│   └── appRegistry.ts
├── hooks/
│   └── useWindowActions.ts
├── types/
│   └── window.types.ts
├── apps/                    # Placeholder app components
│   └── PlaceholderApp.tsx
├── utils/
└── App.tsx
```

---

## 7. Technical Considerations

### Dependencies

| Package | Purpose |
|---------|---------|
| React 18 | UI framework |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| Zustand | State management |
| react-rnd | Drag and resize functionality |
| uuid | Window ID generation |
| babel-plugin-react-compiler | React Compiler for automatic memoization |

### Performance Optimization

1. **React Compiler**: Use React Compiler (babel-plugin-react-compiler) for automatic memoization. Do NOT use manual `useMemo`, `useCallback`, or `React.memo` — let the compiler handle optimization.
2. **Local Refs for Drag/Resize**: During active drag/resize, update position/size via refs or local state, then sync to Zustand on completion.
3. **Selective Subscriptions**: Use Zustand selectors to subscribe only to relevant state slices.
4. **CSS Transforms**: Use `transform: translate()` for positioning during drag (GPU-accelerated).

### React Compiler Setup

The project must be configured with React Compiler. Typical setup with Vite:

```bash
npm install -D babel-plugin-react-compiler @babel/plugin-transform-react-jsx
```

```js
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: ['babel-plugin-react-compiler'],
      },
    }),
  ],
});
```

**Important**: Do not add manual `useMemo`, `useCallback`, or `React.memo`. The compiler will automatically optimize re-renders.

### MFE Preparation

The app registry pattern enables future Module Federation integration:

```typescript
// Current (static)
const appRegistry: Record<string, React.ComponentType> = {
  'placeholder': PlaceholderApp,
};

// Future (dynamic/MFE)
const appRegistry: Record<string, () => Promise<React.ComponentType>> = {
  'remote-app': () => import('remoteApp/Component'),
};
```

### TypeScript Types

```typescript
interface WindowState {
  id: string;
  title: string;
  position: { x: number; y: number };
  size: { w: number; h: number };
  zIndex: number;
  isMinimized: boolean;
  isMaximized: boolean;
  componentType: string;
}

interface WindowStore {
  windows: WindowState[];
  activeWindowId: string | null;
  // ... actions
}
```

---

## 8. Success Metrics

This is a **prototype**, so success is measured by functional completeness rather than business metrics:

| Metric | Target |
|--------|--------|
| All functional requirements implemented | 100% |
| Window drag interaction works smoothly | No visible lag or stutter |
| Window resize interaction works smoothly | No visible lag or stutter |
| Focus management works correctly | Clicking any window brings it to front |
| Minimize/Maximize/Restore work correctly | All state transitions function properly |
| Taskbar reflects window state accurately | Icons appear/update correctly |
| No TypeScript errors | `tsc --noEmit` passes |
| Code is extensible for MFE | App registry pattern in place |
| No manual memoization | No `useMemo`, `useCallback`, or `React.memo` in codebase |
| React Compiler configured | Build succeeds with React Compiler enabled |

---

## 9. Open Questions

All major technical decisions have been resolved:

| Decision | Resolution |
|----------|------------|
| Drag/Resize Library | `react-rnd` |
| Window ID Generation | `uuid` |
| Title Bar Style | macOS-style (traffic light buttons on left) |
| Default Window Size | 50% of viewport, centered |
| Maximum Open Windows | No limit |
| Performance Strategy | React Compiler (no manual memoization) |

**Remaining minor questions (can be decided during implementation):**

1. Should the title bar have a gradient or solid color?
2. What icon set to use for desktop app icons (e.g., Lucide, Heroicons)?

---

## Appendix: Glossary

| Term | Definition |
|------|------------|
| Window Frame | The container component including title bar and content area |
| Title Bar | The top section of a window containing the title and control buttons |
| Z-Index | CSS property determining stack order; higher values appear on top |
| Taskbar/Dock | The bar at the bottom showing open application icons |
| App Registry | A mapping of component type strings to React components |
| MFE (Module Federation) | Webpack feature enabling runtime loading of remote modules |
