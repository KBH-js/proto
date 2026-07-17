import { useToastStore } from '../store/toastStore';
import { translateNow } from '../i18n';

/**
 * Copy an email address to the clipboard with a success/failure toast.
 * Returns whether the copy succeeded so callers can gate follow-up actions
 * (e.g. the start menu only closes on success).
 */
export function useCopyEmail(): (email: string) => Promise<boolean> {
  const addToast = useToastStore((s) => s.addToast);

  return async (email: string) => {
    try {
      await navigator.clipboard.writeText(email);
      addToast({ message: translateNow('taskbar.emailCopied'), type: 'success', duration: 3000 });
      return true;
    } catch {
      addToast({ message: translateNow('taskbar.copyFailed'), type: 'error', duration: 3000 });
      return false;
    }
  };
}
