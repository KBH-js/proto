import { 
  FileText, 
  GitBranch, 
  Calculator, 
  Monitor, 
  Settings, 
  Package,
  Info,
  LucideIcon
} from 'lucide-react';

// Map of icon names to Lucide components
const iconMap: Record<string, LucideIcon> = {
  'file-text': FileText,
  'git-branch': GitBranch,
  'calculator': Calculator,
  'monitor': Monitor,
  'settings': Settings,
  'package': Package,
  'info': Info,
};

interface DesktopIconProps {
  /** Icon to display (lucide icon name or emoji) */
  icon: string;
  /** Label text below the icon */
  label: string;
  /** Double-click handler to launch the app */
  onDoubleClick: () => void;
}

/**
 * Desktop application icon with label.
 * Double-click to launch the associated application.
 * Supports both lucide-react icons (by name) and emojis.
 */
export function DesktopIcon({ icon, label, onDoubleClick }: DesktopIconProps) {
  const IconComponent = iconMap[icon];
  
  // Determine icon color based on icon type
  const getIconColor = () => {
    switch (icon) {
      case 'info': return 'text-blue-400';
      case 'file-text': return 'text-red-400';
      case 'git-branch': return 'text-purple-400';
      case 'calculator': return 'text-orange-400';
      case 'monitor': return 'text-blue-400';
      case 'settings': return 'text-gray-300';
      default: return 'text-white';
    }
  };

  return (
    <button
      onDoubleClick={onDoubleClick}
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
        <div className={`w-12 h-12 flex items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm ${getIconColor()}`}>
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
