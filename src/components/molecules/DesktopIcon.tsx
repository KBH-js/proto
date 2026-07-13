import { getAppIcon, getAppIconColor } from '../shared/appIcons';
import { isTouchDevice } from '../../utils/device';

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

  // Touch devices have no double-click — launch on a single tap there
  const launchProps = isTouchDevice()
    ? { onClick: onLaunch }
    : { onDoubleClick: onLaunch };

  return (
    <button
      {...launchProps}
      data-app-icon={componentType}
      className="
        flex flex-col items-center gap-1 p-2 rounded-lg
        w-20 cursor-pointer
        hover:bg-white/10 active:bg-white/20
        transition-colors duration-150
        focus:outline-none focus:ring-2 focus:ring-white/30
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
      <span className="text-xs text-white text-center leading-tight drop-shadow-md truncate w-full">
        {label}
      </span>
    </button>
  );
}
