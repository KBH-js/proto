import { useMemo } from 'react';
import { useAppRegistry } from '../../registry/appRegistry';
import { TASKBAR_HEIGHT } from '../../types/window.types';
import { DesktopIcon } from '../molecules/DesktopIcon';
import { useAppLauncher } from '../../hooks/useAppLauncher';

/**
 * Desktop component with app launcher icons.
 * Positioned behind all windows with a gradient background.
 * Subscribes to the app registry so icons appear when the
 * remote catalog resolves at runtime.
 */
export function Desktop() {
  const launchApp = useAppLauncher();
  const entries = useAppRegistry((state) => state.entries);
  const availableApps = useMemo(
    () => Object.values(entries).map((entry) => entry.defaultConfig),
    [entries],
  );

  return (
    <div
      className="absolute inset-0 select-none"
      style={{
        paddingBottom: TASKBAR_HEIGHT,
        zIndex: 0,
      }}
    >
      {/* Wallpaper — layered deep-blue/teal gradients (macOS-inspired) */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(120% 90% at 78% 12%, rgba(56, 189, 248, 0.38) 0%, transparent 55%),
            radial-gradient(100% 80% at 12% 85%, rgba(45, 212, 191, 0.32) 0%, transparent 55%),
            radial-gradient(90% 90% at 45% 50%, rgba(59, 130, 246, 0.28) 0%, transparent 65%),
            linear-gradient(160deg, #0a1c33 0%, #0e3055 45%, #14486e 72%, #0a2440 100%)
          `,
        }}
      />

      {/* Desktop icons - positioned on the left side */}
      <div className="relative p-4 flex flex-col gap-2 items-start">
        {availableApps.map((app) => (
          <DesktopIcon
            key={app.componentType}
            icon={app.icon}
            label={app.title}
            onLaunch={() => launchApp(app)}
          />
        ))}
      </div>
    </div>
  );
}
