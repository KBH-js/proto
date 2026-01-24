interface DesktopIconProps {
  /** Icon to display (emoji or component) */
  icon: string;
  /** Label text below the icon */
  label: string;
  /** Double-click handler to launch the app */
  onDoubleClick: () => void;
}

/**
 * Desktop application icon with label.
 * Double-click to launch the associated application.
 */
export function DesktopIcon({ icon, label, onDoubleClick }: DesktopIconProps) {
  return (
    <button
      onDoubleClick={onDoubleClick}
      className="
        flex flex-col items-center gap-1 p-2 rounded-lg
        w-20 cursor-default
        hover:bg-white/10 active:bg-white/20
        transition-colors duration-150
        focus:outline-none focus:ring-2 focus:ring-white/30
        select-none
      "
    >
      <span className="text-4xl drop-shadow-lg">{icon}</span>
      <span className="text-xs text-white text-center leading-tight drop-shadow-md truncate w-full">
        {label}
      </span>
    </button>
  );
}
