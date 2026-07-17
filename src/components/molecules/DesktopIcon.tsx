import { getAppIcon, getAppIconColor } from '../shared/appIcons';

interface DesktopIconProps {
  /** Lucide icon name (from the shared app icon map) or an emoji fallback */
  icon: string;
  label: string;
  onLaunch: () => void;
  /** Registry component type — exposed as data-app-icon so the guide tour can anchor to it */
  componentType?: string;
}

export function DesktopIcon({ icon, label, onLaunch, componentType }: DesktopIconProps) {
  const IconComponent = getAppIcon(icon);

  return (
    // Single click launches everywhere (touch, mouse, and — since a native
    // button fires click on Enter/Space — keyboard too).
    <button
      onClick={onLaunch}
      data-app-icon={componentType}
      className="
        flex flex-col items-center gap-1 p-2 rounded-lg
        w-20 cursor-pointer
        hover:bg-black/5 dark:hover:bg-white/10 active:bg-black/10 dark:active:bg-white/20
        transition-colors duration-150
        focus:outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/30
        select-none
      "
    >
      {IconComponent ? (
        <div className={`w-12 h-12 flex items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm ${getAppIconColor(icon)}`}>
          <IconComponent className="w-7 h-7 drop-shadow-lg" />
        </div>
      ) : (
        <span className="text-4xl drop-shadow-lg">{icon}</span>
      )}
      {/* lg-text swaps its text-shadow with the theme (white lift on light
          glass, dark drop on graphite) — the old text-white was authored for
          the pre-glass dark wallpaper and vanished on the light rail.
          Labels wrap to multiple lines instead of truncating; break-keep
          keeps Korean from breaking mid-word ('디자인 토큰' → two lines). */}
      <span className="lg-text text-xs text-gray-800 dark:text-gray-100 text-center leading-tight break-keep w-full">
        {label}
      </span>
    </button>
  );
}
