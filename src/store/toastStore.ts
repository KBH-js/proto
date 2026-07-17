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

  /** Prints the boot banner with the runtime-registered remote catalog */
  printBanner: (remotes: Array<{ name: string; url: string }> = []) => {
    const WIDTH = 67; // inner width between the ║ borders

    const line = (content: string) => `║${content.padEnd(WIDTH)}║`;
    const remoteHost = (url: string) => {
      try {
        const parsed = new URL(url);
        return `${parsed.protocol}//${parsed.host}`;
      } catch {
        return url;
      }
    };

    const remoteLines = remotes.length > 0
      ? remotes.map((r) => line(`    • ${r.name} → ${remoteHost(r.url)}`))
      : [line('    (no remotes registered)')];

    console.log(
      `%c
╔${'═'.repeat(WIDTH)}╗
${line('           🚀 Proto OS - Micro-Frontend Architecture')}
╠${'═'.repeat(WIDTH)}╣
${line(`  Host: ${window.location.origin}`)}
${line('  Remotes (registered at runtime):')}
${remoteLines.join('\n')}
╚${'═'.repeat(WIDTH)}╝
`,
      'color: #00d8ff; font-family: monospace;'
    );
  },
};
