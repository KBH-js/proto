export interface Position {
  x: number;
  y: number;
}

export interface Size {
  w: number;
  h: number;
}

export interface WindowState {
  id: string;
  title: string;
  position: Position;
  size: Size;
  zIndex: number;
  isMinimized: boolean;
  isMaximized: boolean;
  /** Key into the app registry */
  componentType: string;
  /** Position before maximize, for restore */
  prevPosition?: Position;
  /** Size before maximize, for restore */
  prevSize?: Size;
}

export interface AppConfig {
  /** Unique identifier matching the registry key */
  componentType: string;
  title: string;
  icon: string;
  /** Defaults to 50% of viewport */
  defaultSize?: Size;
  /** Defaults to DEFAULT_MIN_SIZE */
  minSize?: Size;
  /** If set, clicking opens this URL instead of a window */
  externalUrl?: string;
}

export interface WindowStore {
  windows: WindowState[];
  activeWindowId: string | null;

  openWindow: (componentType: string, title: string) => void;
  closeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  /** Restores a window from minimized or maximized state */
  restoreWindow: (id: string) => void;
  updateWindowPosition: (id: string, position: Position) => void;
  updateWindowSize: (id: string, size: Size) => void;
}

export const DEFAULT_MIN_SIZE: Size = { w: 200, h: 150 };
export const TASKBAR_HEIGHT = 52;
export const BASE_Z_INDEX = 100;
export const TASKBAR_Z_INDEX = 9999;
