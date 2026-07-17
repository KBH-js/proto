import { Loader2 } from 'lucide-react';
import { useTranslation } from '../../i18n';

interface LoadingFallbackProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

/** Suspense fallback shown while a remote component loads */
export function LoadingFallback({
  message,
  size = 'md'
}: LoadingFallbackProps) {
  const { t } = useTranslation();
  const label = message ?? t('loading.generic');
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  };

  return (
    // Transparent so the window's Liquid Glass panel shows through while a
    // remote loads; the accent spinner + lifted label read on the frost.
    <div className="flex flex-col items-center justify-center h-full p-6">
      <Loader2
        className={`
          ${sizeClasses[size]}
          text-accent
          animate-spin
        `}
        role="status"
        aria-label={t('loading.generic')}
      />

      {label && (
        <p className="lg-text mt-4 text-gray-600 dark:text-gray-300 text-sm animate-pulse">
          {label}
        </p>
      )}
    </div>
  );
}
