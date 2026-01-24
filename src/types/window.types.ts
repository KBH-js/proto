/**
 * Window Manager Type Definitions
 * 
 * This file contains all TypeScript interfaces and types used by the
 * window manager system.
 */

// ============================================================================
// Basic Types
// ============================================================================

/**
 * Represents a 2D position coordinate
 */
export interface Position {
  x: number;
  y: number;
}

/**
 * Represents dimensions (width and height)
 */
export interface Size {
  w: number;
  h: number;
}

// ============================================================================
// Window Types
// ============================================================================

/**
 * Represents the complete state of a single window
 */
export interface WindowState {
  /** Unique identifier for the window (UUID) */
  id: string;
  
  /** Display title shown in the title bar */
  title: string;
  
  /** Current position of the window */
  position: Position;
  
  /** Current size of the window */
  size: Size;
  
  /** Stack order - higher values appear on top */
  zIndex: number;
  
  /** Whether the window is currently minimized (hidden) */
  isMinimized: boolean;
  
  /** Whether the window is currently maximized (fullscreen) */
  isMaximized: boolean;
  
  /** The type of app component to render inside this window */
  componentType: string;
  
  /** Stored position before maximize (for restore) */
  prevPosition?: Position;
  
  /** Stored size before maximize (for restore) */
  prevSize?: Size;
}

// ============================================================================
// App Registry Types
// ============================================================================

/**
 * Configuration for an application that can be launched
 */
export interface AppConfig {
  /** Unique identifier matching the registry key */
  componentType: string;
  
  /** Default window title */
  title: string;
  
  /** Icon identifier or path */
  icon: string;
  
  /** Optional default window size (defaults to 50% viewport) */
  defaultSize?: Size;
  
  /** Optional minimum window size (defaults to 200x150) */
  minSize?: Size;
}

// ============================================================================
// Store Types
// ============================================================================

/**
 * Zustand store interface for window management
 */
export interface WindowStore {
  // State
  /** Array of all open windows */
  windows: WindowState[];
  
  /** ID of the currently focused/active window */
  activeWindowId: string | null;
  
  // Actions
  /** Opens a new window with the specified app type */
  openWindow: (componentType: string, title: string) => void;
  
  /** Closes and removes a window by ID */
  closeWindow: (id: string) => void;
  
  /** Brings a window to focus (highest z-index) */
  focusWindow: (id: string) => void;
  
  /** Minimizes a window (hides it but keeps in taskbar) */
  minimizeWindow: (id: string) => void;
  
  /** Maximizes a window to fill the viewport */
  maximizeWindow: (id: string) => void;
  
  /** Restores a window from minimized or maximized state */
  restoreWindow: (id: string) => void;
  
  /** Updates the position of a window */
  updateWindowPosition: (id: string, position: Position) => void;
  
  /** Updates the size of a window */
  updateWindowSize: (id: string, size: Size) => void;
}

// ============================================================================
// Constants
// ============================================================================

/** Default minimum window dimensions */
export const DEFAULT_MIN_SIZE: Size = { w: 200, h: 150 };

/** Taskbar height in pixels */
export const TASKBAR_HEIGHT = 52;

/** Base z-index for windows */
export const BASE_Z_INDEX = 100;

/** Z-index for the taskbar (always on top) */
export const TASKBAR_Z_INDEX = 9999;
