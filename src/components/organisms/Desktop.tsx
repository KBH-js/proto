import { useMemo } from 'react';
// Wallpaper gradients live in the shared token source (not inline raw color),
// enforced by the `local/no-raw-colors` lint rule.
import { wallpaper } from '@proto/shared/theme';
import { LiquidGlass } from '@proto/shared/glass';
import { useAppRegistry } from '../../registry/appRegistry';
import { usePrefsStore } from '../../store/prefsStore';
import { useTranslation, translateAppTitle } from '../../i18n';
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
  const { t } = useTranslation();
  const theme = usePrefsStore((state) => state.theme);
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
      {/* Wallpaper — swaps with the shell theme */}
      <div
        className="absolute inset-0"
        style={{ background: theme === 'dark' ? wallpaper.dark : wallpaper.light }}
      />

      {/* Left sidebar Dock — a vertical Liquid Glass rail of app launchers,
          vertically centred against the left edge. Phones get two columns so
          all icons fit on short screens without hidden overflow (windows open
          maximized there, so the wider rail only shows on an empty desktop). */}
      <div className="relative h-full flex items-center pl-3">
        <LiquidGlass
          variant="dock"
          className="grid grid-cols-2 sm:grid-cols-1 gap-1 p-2 max-h-full overflow-y-auto"
        >
          {availableApps.map((app) => (
            <DesktopIcon
              key={app.componentType}
              icon={app.icon}
              label={translateAppTitle(t, app.componentType, app.title)}
              componentType={app.componentType}
              onLaunch={() => launchApp(app)}
            />
          ))}
        </LiquidGlass>
      </div>
    </div>
  );
}
