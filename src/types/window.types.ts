export interface Position {
  x: number;
  y: number;
}

export interface Size {
  w: number;
  h: number;
}

/**
 * Aero-style snap targets. 'top' maximizes; the remaining six tile the
 * window to a half or quarter of the work area.
 */
export type SnapZone =
  | 'left'
  | 'right'
  | 'top'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right';

/** Snap zones that tile (everything except 'top', which maximizes) */
export type TiledSnapZone = Exclude<SnapZone, 'top'>;

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
  /** Set while the window is tiled to a snap zone */
  snapZone?: TiledSnapZone;
  /** Position before maximize/snap, for restore */
  prevPosition?: Position;
  /** Size before maximize/snap, for restore */
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
  /** Tiles the window to a snap zone ('top' delegates to maximize) */
  snapWindow: (id: string, zone: SnapZone) => void;
  /** Restores a tiled window to its pre-snap size, keeping the grab point under the pointer */
  unsnapWindow: (id: string, pointer: Position) => void;
  updateWindowPosition: (id: string, position: Position) => void;
  updateWindowSize: (id: string, size: Size) => void;
  /** Refits every window (maximized/snapped/floating) after a viewport resize */
  handleViewportResize: () => void;
}

export const DEFAULT_MIN_SIZE: Size = { w: 200, h: 150 };
/** Reserved bottom strip for the Dock — includes the floating gap above it */
export const TASKBAR_HEIGHT = 64;
/** Must match TitleBar's h-9 — used to keep titlebars reachable above the taskbar */
export const TITLEBAR_HEIGHT = 36;
export const BASE_Z_INDEX = 100;
export const TASKBAR_Z_INDEX = 9999;
/** Offset applied per already-open window when opening a new one */
export const CASCADE_OFFSET = 24;
/** Pointer distance from a screen edge that arms a snap zone */
export const SNAP_EDGE_THRESHOLD = 12;
/** Distance from a screen corner within which an edge hit becomes a quarter snap */
export const SNAP_CORNER_SIZE = 120;
