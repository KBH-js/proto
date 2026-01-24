import { useToastStore, Toast } from '../../store/toastStore';

/**
 * Individual Toast Component
 */
function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const typeStyles = {
    info: 'bg-blue-900/90 border-blue-500',
    success: 'bg-green-900/90 border-green-500',
    warning: 'bg-yellow-900/90 border-yellow-500',
    error: 'bg-red-900/90 border-red-500',
    system: 'bg-gray-900/95 border-cyan-500',
  };

  const typeIcons = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌',
    system: '⚡',
  };

  return (
    <div
      className={`
        flex items-start gap-3 p-3 rounded-lg border-l-4
        backdrop-blur-sm shadow-xl
        animate-slide-in-right
        ${typeStyles[toast.type]}
      `}
    >
      <span className="text-lg">{typeIcons[toast.type]}</span>
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
        className="text-gray-400 hover:text-white transition-colors"
      >
        ✕
      </button>
    </div>
  );
}

/**
 * Toast Container - Displays system notifications
 * 
 * Positioned at bottom-right of the screen.
 * Used for technical notifications like:
 * - Module Federation events
 * - Remote app loading status
 * - Performance metrics
 */
export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) {
    return null;
  }

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

/**
 * CSS for slide-in animation (add to index.css or global styles)
 * 
 * @keyframes slide-in-right {
 *   from {
 *     transform: translateX(100%);
 *     opacity: 0;
 *   }
 *   to {
 *     transform: translateX(0);
 *     opacity: 1;
 *   }
 * }
 * .animate-slide-in-right {
 *   animation: slide-in-right 0.3s ease-out;
 * }
 */
