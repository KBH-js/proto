import { createContext, useContext, ReactNode, useState, useCallback } from 'react';

/**
 * Host Context for Remote Micro-Frontends
 * 
 * This context provides host state to remote applications loaded via Module Federation.
 * Remote components can access host state (theme, locale) without tight coupling.
 * 
 * ## Usage in Host
 * 
 * Wrap your app with HostProvider:
 * ```tsx
 * <HostProvider>
 *   <App />
 * </HostProvider>
 * ```
 * 
 * ## Usage in Remotes
 * 
 * Remotes can consume this context if provided, with graceful fallback:
 * ```tsx
 * const { theme, locale } = useHostContext();
 * ```
 * 
 * ## Custom Events API (Bidirectional Communication)
 * 
 * For bidirectional communication between host and remotes, use Custom Events:
 * 
 * ### Host → Remote (Broadcast)
 * ```typescript
 * // Host dispatches event
 * window.dispatchEvent(new CustomEvent('host:theme-changed', { 
 *   detail: { theme: 'dark' } 
 * }));
 * 
 * // Remote listens
 * useEffect(() => {
 *   const handler = (e: CustomEvent) => setTheme(e.detail.theme);
 *   window.addEventListener('host:theme-changed', handler);
 *   return () => window.removeEventListener('host:theme-changed', handler);
 * }, []);
 * ```
 * 
 * ### Remote → Host (Request)
 * ```typescript
 * // Remote dispatches event
 * window.dispatchEvent(new CustomEvent('remote:request-fullscreen', {
 *   detail: { windowId: 'calc-1' }
 * }));
 * 
 * // Host listens and responds
 * useEffect(() => {
 *   const handler = (e: CustomEvent) => maximizeWindow(e.detail.windowId);
 *   window.addEventListener('remote:request-fullscreen', handler);
 *   return () => window.removeEventListener('remote:request-fullscreen', handler);
 * }, []);
 * ```
 * 
 * ### Event Naming Convention
 * - `host:*` - Events dispatched by host
 * - `remote:*` - Events dispatched by remotes
 */

/**
 * Value provided by the HostContext
 */
export interface HostContextValue {
  /** Current theme mode */
  theme: 'light' | 'dark';
  /** Current locale/language code */
  locale: string;
  /** Set the theme (for future settings integration) */
  setTheme: (theme: 'light' | 'dark') => void;
  /** Set the locale (for future i18n integration) */
  setLocale: (locale: string) => void;
}

/**
 * Default values when context is not available
 * Used by remotes when running outside the host
 */
const defaultValues: Omit<HostContextValue, 'setTheme' | 'setLocale'> = {
  theme: 'dark',
  locale: 'en',
};

/**
 * The Host Context
 * Null when not wrapped in HostProvider (e.g., in standalone remote mode)
 */
export const HostContext = createContext<HostContextValue | null>(null);

/**
 * Hook to access the Host Context
 * 
 * Returns the context value if available, or default values if not.
 * This allows remotes to gracefully handle running outside the host.
 * 
 * @returns HostContextValue with theme, locale, and setter functions
 */
export function useHostContext(): HostContextValue {
  const context = useContext(HostContext);
  
  // If context is not available (running standalone), return defaults with no-op setters
  if (!context) {
    return {
      ...defaultValues,
      setTheme: () => {
        console.warn('useHostContext: setTheme called outside HostProvider');
      },
      setLocale: () => {
        console.warn('useHostContext: setLocale called outside HostProvider');
      },
    };
  }
  
  return context;
}

/**
 * Props for the HostProvider component
 */
interface HostProviderProps {
  children: ReactNode;
  /** Initial theme (defaults to 'dark') */
  initialTheme?: 'light' | 'dark';
  /** Initial locale (defaults to 'en') */
  initialLocale?: string;
}

/**
 * Provider component that supplies host context to the app tree
 * 
 * Wrap your root component with this provider to make host state
 * available to all children, including remote micro-frontends.
 */
export function HostProvider({ 
  children, 
  initialTheme = 'dark',
  initialLocale = 'en',
}: HostProviderProps) {
  const [theme, setThemeState] = useState<'light' | 'dark'>(initialTheme);
  const [locale, setLocaleState] = useState(initialLocale);
  
  const setTheme = useCallback((newTheme: 'light' | 'dark') => {
    setThemeState(newTheme);
    // Dispatch custom event for remotes that might be listening
    window.dispatchEvent(new CustomEvent('host:theme-changed', {
      detail: { theme: newTheme },
    }));
  }, []);
  
  const setLocale = useCallback((newLocale: string) => {
    setLocaleState(newLocale);
    // Dispatch custom event for remotes that might be listening
    window.dispatchEvent(new CustomEvent('host:locale-changed', {
      detail: { locale: newLocale },
    }));
  }, []);
  
  const value: HostContextValue = {
    theme,
    locale,
    setTheme,
    setLocale,
  };
  
  return (
    <HostContext.Provider value={value}>
      {children}
    </HostContext.Provider>
  );
}

export default HostContext;
