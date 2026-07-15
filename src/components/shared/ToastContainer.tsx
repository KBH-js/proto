import { Info, CheckCircle2, AlertTriangle, XCircle, Zap, X } from 'lucide-react';
import { useToastStore, Toast } from '../../store/toastStore';
import { usePrefsStore } from '../../store/prefsStore';
import { useTranslation } from '../../i18n';

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const { t } = useTranslation();

  // Left accent edge only — the body is theme-reactive liquid glass.
  const typeAccent = {
    info: 'border-l-blue-500',
    success: 'border-l-green-500',
    warning: 'border-l-yellow-500',
    error: 'border-l-red-500',
    system: 'border-l-cyan-500',
  };

  const typeIcons = {
    info: <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
    success: <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />,
    warning: <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />,
    error: <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />,
    system: <Zap className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />,
  };

  return (
    <div
      // status → polite, alert → assertive; per-item roles avoid the whole
      // stack being re-announced when one toast is added or removed.
      role={toast.type === 'error' ? 'alert' : 'status'}
      // Hairline as a ring (not border) so it can't collide with the left
      // accent: `dark:border-white/10` would out-specify `border-l-*-500`.
      className={`
        flex items-start gap-3 p-3 rounded-xl
        glass-chrome shadow-xl
        ring-1 ring-inset ring-white/50 dark:ring-white/10
        border-l-4 ${typeAccent[toast.type]}
        animate-slide-in-right
      `}
    >
      {typeIcons[toast.type]}
      <div className="flex-1 min-w-0">
        <p className="lg-text text-sm font-mono text-gray-800 dark:text-gray-100 break-words">
          {toast.message}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-mono">
          {new Date(toast.timestamp).toLocaleTimeString()}
        </p>
      </div>
      <button
        onClick={onDismiss}
        aria-label={t('toast.dismiss')}
        className="text-gray-400 hover:text-gray-700 dark:text-gray-500 dark:hover:text-white transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

/** Bottom-right system notifications (Module Federation events, etc.) */
export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();
  // Mounted at the app root, OUTSIDE the shell's `.dark` scope — re-scope the
  // theme here (same reason FirstRunTour does) or every dark: variant and the
  // .dark .glass-chrome override silently stay on the light look.
  const theme = usePrefsStore((state) => state.theme);

  // Always mounted (no early return) so assistive tech reliably announces
  // toasts inserted into an existing live region; the empty div is invisible.
  return (
    <div
      className={`fixed bottom-20 right-4 z-[9999] flex flex-col gap-2 max-w-md ${theme === 'dark' ? 'dark' : ''}`}
    >
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
