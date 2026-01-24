/**
 * Loading Fallback Component
 * 
 * Displayed while a remote component is being loaded via React.lazy/Suspense.
 * Shows a centered spinner with optional loading text.
 * 
 * @example
 * ```tsx
 * <Suspense fallback={<LoadingFallback />}>
 *   <LazyRemoteComponent />
 * </Suspense>
 * ```
 */

interface LoadingFallbackProps {
  /** Optional loading message */
  message?: string;
  /** Size of the spinner: 'sm', 'md', 'lg' */
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingFallback({ 
  message = 'Loading...', 
  size = 'md' 
}: LoadingFallbackProps) {
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-3',
    lg: 'w-16 h-16 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center h-full bg-background-surface p-6">
      {/* Spinner */}
      <div
        className={`
          ${sizeClasses[size]}
          border-foreground-tertiary
          border-t-accent-primary
          rounded-full
          animate-spin
        `}
        role="status"
        aria-label="Loading"
      />
      
      {/* Loading Text */}
      {message && (
        <p className="mt-4 text-foreground-secondary text-sm animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
}

/**
 * Skeleton variant for content loading
 * Shows pulsing placeholder blocks
 */
export function LoadingSkeleton() {
  return (
    <div className="flex flex-col h-full bg-background-surface p-4 animate-pulse">
      {/* Header skeleton */}
      <div className="h-8 bg-background-secondary rounded-lg w-3/4 mb-4" />
      
      {/* Content skeleton lines */}
      <div className="space-y-3 flex-1">
        <div className="h-4 bg-background-secondary rounded w-full" />
        <div className="h-4 bg-background-secondary rounded w-5/6" />
        <div className="h-4 bg-background-secondary rounded w-4/6" />
        <div className="h-4 bg-background-secondary rounded w-full" />
        <div className="h-4 bg-background-secondary rounded w-3/4" />
      </div>
      
      {/* Footer skeleton */}
      <div className="h-10 bg-background-secondary rounded-lg w-1/2 mt-4" />
    </div>
  );
}

export default LoadingFallback;
