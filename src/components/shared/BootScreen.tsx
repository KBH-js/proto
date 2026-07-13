import { useState, useEffect } from 'react';
import { Terminal, Loader2 } from 'lucide-react';
import { LiquidGlass } from '@proto/shared/glass';
import { wallpaper } from '@proto/shared/theme';
import { usePrefsStore } from '../../store/prefsStore';
import { useAppRegistry } from '../../registry/appRegistry';
import { useTranslation } from '../../i18n';

interface BootScreenProps {
  /** Called once the splash may be dismissed (registry resolved + min elapsed) */
  onBootComplete: () => void;
  /** Small floor so an instant catalog resolve doesn't flash the splash */
  minDuration?: number;
}

/**
 * Minimal Liquid Glass boot splash.
 *
 * Honest by construction: the spinner runs until the app catalog actually
 * resolves — `initializeAppRegistry()` flips the registry out of 'loading'
 * (ready) or 'degraded' — not on a scripted timer. `minDuration` is only a
 * small floor so a sub-frame resolve doesn't flash. Its sole job is to hold the
 * desktop until the remote catalog is registered, avoiding a half-empty flash
 * where remote icons pop in late.
 *
 * Self-scopes the `dark` class (it mounts outside the shell root) so glass
 * tokens + `dark:` variants track the persisted theme, and paints the colour
 * wallpaper behind a frosted card that refracts it.
 */
export function BootScreen({ onBootComplete, minDuration = 400 }: BootScreenProps) {
  const { t } = useTranslation();
  const isDark = usePrefsStore((s) => s.theme === 'dark');
  const status = useAppRegistry((s) => s.status);

  const [minElapsed, setMinElapsed] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  // The only timer: a small minimum so instant loads don't flash the splash.
  useEffect(() => {
    const timer = setTimeout(() => setMinElapsed(true), minDuration);
    return () => clearTimeout(timer);
  }, [minDuration]);

  // Dismiss once the catalog has really resolved (ready or degraded) AND the
  // minimum has elapsed — fade, then hand back to the App.
  const ready = minElapsed && status !== 'loading';
  useEffect(() => {
    if (!ready) return;
    setFadeOut(true);
    const timer = setTimeout(onBootComplete, 260);
    return () => clearTimeout(timer);
  }, [ready, onBootComplete]);

  return (
    <div
      className={`
        fixed inset-0 z-[99999]
        flex flex-col items-center justify-center
        transition-opacity duration-300
        ${fadeOut ? 'opacity-0' : 'opacity-100'}
        ${isDark ? 'dark' : ''}
      `}
      style={{ background: isDark ? wallpaper.dark : wallpaper.light }}
    >
      <LiquidGlass variant="window" radius={26} className="flex flex-col items-center px-10 py-8">
        <div className="w-16 h-16 rounded-2xl bg-accent/15 ring-1 ring-white/40 dark:ring-white/15 flex items-center justify-center">
          <Terminal className="w-8 h-8 text-accent" />
        </div>
        <h1 className="lg-text mt-4 text-2xl font-bold tracking-wide text-gray-800 dark:text-white">
          KBH-Desktop
        </h1>
        <p className="lg-text mt-1 text-xs text-gray-600 dark:text-white/70">{t('boot.subtitle')}</p>
        <Loader2
          className="mt-5 w-5 h-5 text-accent animate-spin"
          role="status"
          aria-label={t('boot.init')}
        />
      </LiquidGlass>
    </div>
  );
}
