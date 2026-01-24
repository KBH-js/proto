import { create } from 'zustand';

/**
 * Toast notification type
 */
export interface Toast {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'system';
  /** Duration in milliseconds (0 = manual dismiss) */
  duration: number;
  /** Timestamp when toast was created */
  timestamp: number;
}

interface ToastState {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id' | 'timestamp'>) => string;
  removeToast: (id: string) => void;
  clearAll: () => void;
}

let toastCounter = 0;

/**
 * Toast Store for System Notifications
 * 
 * Used to display technical information like:
 * - Module Federation load events
 * - Remote app connection status
 * - Performance metrics
 */
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
    
    // Auto-remove after duration (if not 0)
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

/**
 * Styled Console Logger for Module Federation Events
 * 
 * Creates visually distinct console output for technical information.
 */
export const federationLogger = {
  /**
   * Log a successful module load
   */
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
  
  /**
   * Log a module load failure
   */
  moduleFailed: (moduleName: string, error: string) => {
    console.log(
      `%c[Module Federation]%c Failed to load %c${moduleName}%c: ${error}`,
      'background: #ff4757; color: white; font-weight: bold; padding: 2px 6px; border-radius: 3px;',
      'color: #ff6b6b;',
      'color: #ff6b6b; font-weight: bold;',
      'color: #aaa;'
    );
  },
  
  /**
   * Log connection established with remote
   */
  connectionEstablished: (remoteName: string, url: string) => {
    console.log(
      `%c[Module Federation]%c Connection established with %c${remoteName}%c at %c${url}`,
      'background: #1a1a2e; color: #00d8ff; font-weight: bold; padding: 2px 6px; border-radius: 3px;',
      'color: #bada55;',
      'color: #00d8ff; font-weight: bold;',
      'color: #bada55;',
      'color: #aaa; font-style: italic;'
    );
  },
  
  /**
   * Log host context shared with remote
   */
  contextShared: (theme: string, locale: string) => {
    console.log(
      `%c[Host Context]%c Shared state → theme: %c${theme}%c, locale: %c${locale}`,
      'background: #6c5ce7; color: white; font-weight: bold; padding: 2px 6px; border-radius: 3px;',
      'color: #a29bfe;',
      'color: #ffeaa7; font-weight: bold;',
      'color: #a29bfe;',
      'color: #ffeaa7; font-weight: bold;'
    );
  },
  
  /**
   * Print the Module Federation banner on app start
   */
  printBanner: () => {
    // Get remote URL from build-time define (see vite.config.ts)
    const remoteCalcUrl = typeof __REMOTE_CALCULATOR_URL__ !== 'undefined' 
      ? __REMOTE_CALCULATOR_URL__ 
      : 'http://localhost:5001/assets/remoteEntry.js';
    
    // Extract hostname for display
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
