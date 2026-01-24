import { useWindowStore } from '../../store/windowStore';
import { getAvailableApps } from '../../registry/appRegistry';
import { TASKBAR_HEIGHT, AppConfig } from '../../types/window.types';
import { DesktopIcon } from '../molecules/DesktopIcon';

/**
 * Desktop component with app launcher icons.
 * Positioned behind all windows with a gradient background.
 */
export function Desktop() {
  const openWindow = useWindowStore((state) => state.openWindow);
  const availableApps = getAvailableApps();

  const handleAppLaunch = (app: AppConfig) => {
    // If app has an external URL, open it in a new tab
    if (app.externalUrl) {
      window.open(app.externalUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    
    // Otherwise, open as a window
    console.log('Launching app:', app.componentType, app.title);
    openWindow(app.componentType, app.title);
  };

  return (
    <div
      className="absolute inset-0 select-none"
      style={{
        paddingBottom: TASKBAR_HEIGHT,
        zIndex: 0,
      }}
    >
      {/* Background gradient - macOS-inspired */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        }}
      />

      {/* Desktop icons - positioned on the left side */}
      <div className="relative p-4 flex flex-col gap-2 items-start">
        {availableApps.map((app) => (
          <DesktopIcon
            key={app.componentType}
            icon={app.icon}
            label={app.title}
            onDoubleClick={() => handleAppLaunch(app)}
          />
        ))}
      </div>
    </div>
  );
}
