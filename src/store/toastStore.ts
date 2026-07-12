import { create } from 'zustand';

export interface Toast {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'system';
  /** Duration in milliseconds (0 = manual dismiss) */
  duration: number;
  timestamp: number;
}

interface ToastState {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id' | 'timestamp'>) => string;
  removeToast: (id: string) => void;
  clearAll: () => void;
}

let toastCounter = 0;

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],

  addToast: (toast) => {
    const id = `toast-${++toastCounter}`;
    const newToast: Toast = {
      ...toast,
      id,
      timestamp: Date.now(),
    };

    set((state) => ({
      toasts: [...state.toasts, newToast],
    }));

    if (toast.duration > 0) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      }, toast.duration);
    }

    return id;
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  clearAll: () => {
    set({ toasts: [] });
  },
}));

/** Styled console logging for Module Federation events */
export const federationLogger = {
  moduleLoaded: (moduleName: string, loadTimeMs: number) => {
    console.log(
      `%c[Module Federation]%c Remote module %c${moduleName}%c loaded in %c${loadTimeMs}ms`,
      'background: #1a1a2e; color: #00d8ff; font-weight: bold; padding: 2px 6px; border-radius: 3px;',
      'color: #bada55;',
      'color: #ff6b6b; font-weight: bold;',
      'color: #bada55;',
      'color: #ffd93d; font-weight: bold;'
    );
  },

  moduleFailed: (moduleName: string, error: string) => {
    console.log(
      `%c[Module Federation]%c Failed to load %c${moduleName}%c: ${error}`,
      'background: #ff4757; color: white; font-weight: bold; padding: 2px 6px; border-radius: 3px;',
      'color: #ff6b6b;',
      'color: #ff6b6b; font-weight: bold;',
      'color: #aaa;'
    );
  },

  printBanner: () => {
    // __REMOTE_CALCULATOR_URL__ is a build-time define (see vite.config.ts)
    const remoteCalcUrl = typeof __REMOTE_CALCULATOR_URL__ !== 'undefined'
      ? __REMOTE_CALCULATOR_URL__
      : 'http://localhost:5001/assets/remoteEntry.js';

    const remoteHost = (() => {
      try {
        const url = new URL(remoteCalcUrl);
        return `${url.protocol}//${url.host}`;
      } catch {
        return remoteCalcUrl;
      }
    })();

    const hostUrl = window.location.origin;

    console.log(
      `%c
╔═══════════════════════════════════════════════════════════════════╗
║             🚀 Proto OS - Micro-Frontend Architecture             ║
╠═══════════════════════════════════════════════════════════════════╣
║  Host: ${hostUrl.padEnd(55)}║
║  Remotes:                                                         ║
║    • remoteCalculator → ${remoteHost.padEnd(39)}║
╚═══════════════════════════════════════════════════════════════════╝
`,
      'color: #00d8ff; font-family: monospace;'
    );
  },
};
