import { Component, ReactNode } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { federationLogger } from '../../store/toastStore';

interface ErrorBoundaryProps {
  /** Name of the app for display in error message */
  appName?: string;
  children: ReactNode;
  fallback?: ReactNode;
  /** Callback to close the window (used for remote app failures) */
  onClose?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Catches render errors from remote components (e.g. when a remote server is
 * offline) so a failed remote doesn't crash the whole host.
 */

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    const { appName = 'Unknown' } = this.props;
    federationLogger.moduleFailed(appName, error.message);
    console.error('Component stack:', errorInfo.componentStack);
  }

  render(): ReactNode {
    const { hasError, error } = this.state;
    const { appName = 'Application', children, fallback, onClose } = this.props;

    if (hasError) {
      if (fallback) {
        return fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center h-full bg-gray-50 p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>

          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            {appName} is currently unavailable
          </h2>

          <p className="text-gray-500 text-sm mb-4 max-w-xs">
            The remote application could not be loaded. Please ensure the service is running and try opening the app again.
          </p>

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
      );
    }

    return <>{children}</>;
  }
}

export default ErrorBoundary;
