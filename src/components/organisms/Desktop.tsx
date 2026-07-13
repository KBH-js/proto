import { useMemo, useState } from 'react';
// Wallpaper gradients live in the shared token source (not inline raw color),
// enforced by the `local/no-raw-colors` lint rule.
import { wallpaper } from '@proto/shared/theme';
import { useAppRegistry } from '../../registry/appRegistry';
import { usePrefsStore } from '../../store/prefsStore';
import { useTranslation, translateAppTitle } from '../../i18n';
import { TASKBAR_HEIGHT } from '../../types/window.types';
import { DesktopIcon } from '../molecules/DesktopIcon';
import { DesktopContextMenu } from './DesktopContextMenu';
import { useAppLauncher } from '../../hooks/useAppLauncher';

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
        style={{ background: theme === 'dark' ? wallpaper.dark : wallpaper.light }}
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
