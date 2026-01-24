import { Component, ReactNode } from 'react';

/**
 * Error Boundary for Remote Micro-Frontends
 * 
 * Catches errors during rendering of remote components (e.g., when a remote
 * server is offline) and displays a friendly error UI with retry capability.
 * 
 * This prevents the entire host app from crashing when a remote fails to load.
 * 
 * @example
 * ```tsx
 * <ErrorBoundary appName="Calculator">
 *   <Suspense fallback={<LoadingFallback />}>
 *     <LazyCalculatorApp />
 *   </Suspense>
 * </ErrorBoundary>
 * ```
 */

interface ErrorBoundaryProps {
  /** Name of the app for display in error message */
  appName?: string;
  /** Child components to render */
  children: ReactNode;
  /** Optional custom fallback UI */
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  /** Whether an error has occurred */
  hasError: boolean;
  /** The error that was caught */
  error: Error | null;
  /** Key to force re-render on retry */
  retryKey: number;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      retryKey: 0,
    };
  }

  /**
   * Update state when an error is caught during rendering
   */
  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  /**
   * Log error information for debugging
   */
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error);
    console.error('Component stack:', errorInfo.componentStack);
    
    // In production, you might send this to an error reporting service
    // errorReportingService.log({ error, componentStack: errorInfo.componentStack });
  }

  /**
   * Reset error state and increment retry key to force re-render
   */
  handleRetry = (): void => {
    this.setState((prevState) => ({
      hasError: false,
      error: null,
      retryKey: prevState.retryKey + 1,
    }));
  };

  render(): ReactNode {
    const { hasError, error, retryKey } = this.state;
    const { appName = 'Application', children, fallback } = this.props;

    if (hasError) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback;
      }

      // Default error UI
      return (
        <div className="flex flex-col items-center justify-center h-full bg-background-surface p-6 text-center">
          {/* Warning Icon */}
          <div className="text-6xl mb-4">⚠️</div>
          
          {/* Primary Message */}
          <h2 className="text-xl font-semibold text-foreground-primary mb-2">
            {appName} is currently unavailable
          </h2>
          
          {/* Secondary Message */}
          <p className="text-foreground-secondary text-sm mb-4 max-w-xs">
            The remote application could not be loaded. Please ensure the service is running.
          </p>
          
          {/* Error Details (collapsed by default in production) */}
          {error && (
            <details className="mb-4 text-xs text-foreground-tertiary max-w-xs">
              <summary className="cursor-pointer hover:text-foreground-secondary">
                Technical details
              </summary>
              <pre className="mt-2 p-2 bg-background-secondary rounded text-left overflow-auto max-h-24">
                {error.message}
              </pre>
            </details>
          )}
          
          {/* Retry Button */}
          <button
            onClick={this.handleRetry}
            className="px-4 py-2 bg-accent-primary hover:bg-accent-hover text-foreground-primary rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <span>🔄</span>
            <span>Retry</span>
          </button>
        </div>
      );
    }

    // Use key to force re-mount children on retry
    return <div key={retryKey}>{children}</div>;
  }
}

export default ErrorBoundary;
