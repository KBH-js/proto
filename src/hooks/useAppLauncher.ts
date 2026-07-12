import { AppConfig } from '../types/window.types';
import { useWindowStore } from '../store/windowStore';

/**
 * Launch an app config: external-URL entries (Resume) open a new tab,
 * everything else opens (or refocuses) a window. Shared by the desktop
 * icons and the start menu.
 */
export function useAppLauncher(): (app: AppConfig) => void {
  const openWindow = useWindowStore((state) => state.openWindow);

  return (app: AppConfig) => {
    if (app.externalUrl) {
      window.open(app.externalUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    openWindow(app.componentType, app.title);
  };
}
