import { Component, ReactNode } from 'react';
import { AlertTriangle, RotateCcw, X } from 'lucide-react';
import { federationLogger } from '../../store/toastStore';

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
  /** Callback to close the window (used for remote app failures) */
  onClose?: () => void;
  /**
   * Callback to retry loading the failed app (remote apps only).
   * Must invalidate the failed module (fresh lazy wrapper + force
   * re-registration) BEFORE this boundary re-renders its children —
   * see WindowFrame.handleRetry.
   */
  onRetry?: () => void;
}

interface ErrorBoundaryState {
  /** Whether an error has occurred */
  hasError: boolean;
  /** The error that was caught */
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
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
    const { appName = 'Unknown' } = this.props;
    
    // Use styled console logger for Module Federation errors
    federationLogger.moduleFailed(appName, error.message);
    
    // Also log component stack for debugging
    console.error('Component stack:', errorInfo.componentStack);
  }

  /**
   * Retry loading the failed app: let the parent invalidate the failed
   * module first, then clear the error so the fresh children render.
   */
  handleRetry = (): void => {
    this.props.onRetry?.();
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    const { hasError, error } = this.state;
    const { appName = 'Application', children, fallback, onClose, onRetry } = this.props;

    if (hasError) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback;
      }

      // Default error UI
      return (
        <div className="flex flex-col items-center justify-center h-full bg-gray-50 p-6 text-center">
          {/* Warning Icon */}
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          
          {/* Primary Message */}
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            {appName} is currently unavailable
          </h2>
          
          {/* Secondary Message */}
          <p className="text-gray-500 text-sm mb-4 max-w-xs">
            The remote application could not be loaded. Make sure the remote service is running, then try again — only this window is affected.
          </p>
          
          {/* Error Details (collapsed by default in production) */}
          {error && (
            <details className="mb-4 text-xs text-gray-400 max-w-xs">
              <summary className="cursor-pointer hover:text-gray-600">
                Technical details
              </summary>
              <pre className="mt-2 p-2 bg-gray-200 rounded text-left overflow-auto max-h-24 text-gray-700">
                {error.message}
              </pre>
            </details>
          )}
          
          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {onRetry && (
              <button
                onClick={this.handleRetry}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Try Again</span>
              </button>
            )}
            {onClose && (
              <button
                onClick={onClose}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                <span>Close Window</span>
              </button>
            )}
          </div>
        </div>
      );
    }

    return <>{children}</>;
  }
}

export default ErrorBoundary;
