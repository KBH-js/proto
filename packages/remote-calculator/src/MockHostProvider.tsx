import { createContext, useContext, ReactNode } from 'react';

/**
 * Mock Host Context for Standalone Mode
 * 
 * This provider simulates the HostContext that would be provided by the
 * host application when the Calculator runs in integration mode.
 * 
 * In standalone mode (pnpm dev), this provides default values so the
 * Calculator can run independently for development and testing.
 * 
 * In integration mode (running inside the host OS), the real HostContext
 * from the host app will be used instead.
 */

export interface HostContextValue {
  /** Current theme mode */
  theme: 'light' | 'dark';
  /** Current locale/language */
  locale: string;
  /** Window dimensions (if needed) */
  windowSize?: { width: number; height: number };
}

// Default mock values for standalone development
const defaultMockValues: HostContextValue = {
  theme: 'dark',
  locale: 'en',
};

const MockHostContext = createContext<HostContextValue | null>(null);

/**
 * Hook to access the mock host context
 * Returns default values if context is not available
 */
export function useMockHostContext(): HostContextValue {
  const context = useContext(MockHostContext);
  
  // Gracefully fall back to defaults if context is not available
  if (!context) {
    return defaultMockValues;
  }
  
  return context;
}

interface MockHostProviderProps {
  children: ReactNode;
  /** Override default mock values for testing */
  overrides?: Partial<HostContextValue>;
}

/**
 * Provider component for standalone mode
 * Wraps children with mock host context values
 */
export function MockHostProvider({ children, overrides }: MockHostProviderProps) {
  const value: HostContextValue = {
    ...defaultMockValues,
    ...overrides,
  };

  return (
    <MockHostContext.Provider value={value}>
      {children}
    </MockHostContext.Provider>
  );
}

export default MockHostProvider;
