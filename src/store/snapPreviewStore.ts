import { create } from 'zustand';
import { SnapZone } from '../types/window.types';

interface SnapPreviewStore {
  /** Zone the pointer is currently arming during a drag, if any */
  zone: SnapZone | null;
  setZone: (zone: SnapZone | null) => void;
}

/**
 * Drag-time snap preview state. Kept out of windowStore so per-drag
 * updates never re-render window/taskbar subscribers or hit persist.
 * Writes are guarded to zone *transitions*, not every mousemove.
 */
export const useSnapPreviewStore = create<SnapPreviewStore>((set, get) => ({
  zone: null,
  setZone: (zone) => {
    if (get().zone === zone) return;
    set({ zone });
  },
}));
