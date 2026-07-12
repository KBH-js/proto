import { Loader2 } from 'lucide-react';

interface LoadingFallbackProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

/** Suspense fallback shown while a remote component loads */
export function LoadingFallback({
  message = 'Loading...',
  size = 'md'
}: LoadingFallbackProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  };

  return (
    <div className="flex flex-col items-center justify-center h-full bg-gray-50 p-6">
      <Loader2
        className={`
          ${sizeClasses[size]}
          text-purple-500
          animate-spin
        `}
        role="status"
        aria-label="Loading"
      />

      {message && (
        <p className="mt-4 text-gray-500 text-sm animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
}

export default LoadingFallback;
