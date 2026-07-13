import { AlertTriangle, RefreshCw } from 'lucide-react';
import type { TFunction } from '../i18n';

/** Skeleton rows shown while a query is pending. */
export function LoadingRows({ rows = 5 }: { rows?: number }) {
  return (
    <div className="p-3 space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-8 rounded-md bg-sunken animate-pulse" />
      ))}
    </div>
  );
}

/** Error panel with a retry button — the recover half of the outage demo. */
export function ErrorState({ onRetry, t }: { onRetry: () => void; t: TFunction }) {
  return (
    <div className="flex flex-col items-center gap-2 p-6 text-center">
      <AlertTriangle className="h-6 w-6 text-danger" />
      <p className="text-sm font-semibold text-body">{t('errorTitle')}</p>
      <p className="max-w-xs text-xs text-muted">{t('errorBody')}</p>
      <button
        onClick={onRetry}
        className="mt-1 inline-flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90"
      >
        <RefreshCw className="h-3.5 w-3.5" />
        {t('retry')}
      </button>
    </div>
  );
}

/** Empty-list placeholder. */
export function EmptyState({ t }: { t: TFunction }) {
  return <div className="p-6 text-center text-sm text-muted">{t('empty')}</div>;
}
