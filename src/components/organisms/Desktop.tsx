import { useMemo, useState } from 'react';
import { useAppRegistry } from '../../registry/appRegistry';
import { usePrefsStore } from '../../store/prefsStore';
import { useTranslation, translateAppTitle } from '../../i18n';
import { TASKBAR_HEIGHT } from '../../types/window.types';
import { DesktopIcon } from '../molecules/DesktopIcon';
import { DesktopContextMenu } from './DesktopContextMenu';
import { useAppLauncher } from '../../hooks/useAppLauncher';

/** Dark shell wallpaper — layered deep-blue/teal gradients (macOS-inspired) */
const WALLPAPER_DARK = `
  radial-gradient(120% 90% at 78% 12%, rgba(56, 189, 248, 0.38) 0%, transparent 55%),
  radial-gradient(100% 80% at 12% 85%, rgba(45, 212, 191, 0.32) 0%, transparent 55%),
  radial-gradient(90% 90% at 45% 50%, rgba(59, 130, 246, 0.28) 0%, transparent 65%),
  linear-gradient(160deg, #0a1c33 0%, #0e3055 45%, #14486e 72%, #0a2440 100%)
`;

/** Light shell wallpaper — brighter blues; kept mid-toned so white icon labels stay legible */
const WALLPAPER_LIGHT = `
  radial-gradient(120% 90% at 78% 12%, rgba(125, 211, 252, 0.45) 0%, transparent 55%),
  radial-gradient(100% 80% at 12% 85%, rgba(94, 234, 212, 0.40) 0%, transparent 55%),
  radial-gradient(90% 90% at 45% 50%, rgba(96, 165, 250, 0.32) 0%, transparent 65%),
  linear-gradient(160deg, #93c5fd 0%, #60a5fa 45%, #3b82f6 74%, #2563eb 100%)
`;

/**
 * Desktop component with app launcher icons.
 * Positioned behind all windows with a gradient background.
 * Subscribes to the app registry so icons appear when the
 * remote catalog resolves at runtime.
 */
export function Desktop() {
  const launchApp = useAppLauncher();
  const { t } = useTranslation();
  const theme = usePrefsStore((state) => state.theme);
  const entries = useAppRegistry((state) => state.entries);
  const availableApps = useMemo(
    () => Object.values(entries).map((entry) => entry.defaultConfig),
    [entries],
  );

  // Right-click menu anchored at the click point (null = closed)
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);

  return (
    <div
      className="absolute inset-0 select-none"
      style={{
        paddingBottom: TASKBAR_HEIGHT,
        zIndex: 0,
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        setMenu({ x: e.clientX, y: e.clientY });
      }}
    >
      {/* Wallpaper — swaps with the shell theme */}
      <div
        className="absolute inset-0"
        style={{ background: theme === 'dark' ? WALLPAPER_DARK : WALLPAPER_LIGHT }}
      />

      {/* Desktop icons - positioned on the left side */}
      <div className="relative p-4 flex flex-col gap-2 items-start">
        {availableApps.map((app) => (
          <DesktopIcon
            key={app.componentType}
            icon={app.icon}
            label={translateAppTitle(t, app.componentType, app.title)}
            componentType={app.componentType}
            onLaunch={() => launchApp(app)}
          />
        ))}
      </div>

      {menu && <DesktopContextMenu x={menu.x} y={menu.y} onClose={() => setMenu(null)} />}
    </div>
  );
}
