import { Info, CheckCircle2, AlertTriangle, XCircle, Zap, X } from 'lucide-react';
import { useToastStore, Toast } from '../../store/toastStore';
import { useTranslation } from '../../i18n';

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const { t } = useTranslation();
  const typeStyles = {
    info: 'bg-blue-900/90 border-blue-500',
    success: 'bg-green-900/90 border-green-500',
    warning: 'bg-yellow-900/90 border-yellow-500',
    error: 'bg-red-900/90 border-red-500',
    system: 'bg-gray-900/95 border-cyan-500',
  };

  const typeIcons = {
    info: <Info className="w-5 h-5 text-blue-400" />,
    success: <CheckCircle2 className="w-5 h-5 text-green-400" />,
    warning: <AlertTriangle className="w-5 h-5 text-yellow-400" />,
    error: <XCircle className="w-5 h-5 text-red-400" />,
    system: <Zap className="w-5 h-5 text-cyan-400" />,
  };

  return (
    <div
      // status → polite, alert → assertive; per-item roles avoid the whole
      // stack being re-announced when one toast is added or removed.
      role={toast.type === 'error' ? 'alert' : 'status'}
      className={`
        flex items-start gap-3 p-3 rounded-lg border-l-4
        backdrop-blur-sm shadow-xl
        animate-slide-in-right
        ${typeStyles[toast.type]}
      `}
    >
      {typeIcons[toast.type]}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-mono text-gray-100 break-words">
          {toast.message}
        </p>
        <p className="text-xs text-gray-400 mt-1 font-mono">
          {new Date(toast.timestamp).toLocaleTimeString()}
        </p>
      </div>
      <button
        onClick={onDismiss}
        aria-label={t('toast.dismiss')}
        className="text-gray-400 hover:text-white transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

/** Bottom-right system notifications (Module Federation events, etc.) */
export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  // Always mounted (no early return) so assistive tech reliably announces
  // toasts inserted into an existing live region; the empty div is invisible.
  return (
    <div className="fixed bottom-20 right-4 z-[9999] flex flex-col gap-2 max-w-md">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onDismiss={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}
