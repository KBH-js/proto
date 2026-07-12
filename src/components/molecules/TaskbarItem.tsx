import { WindowState } from '../../types/window.types';
import { getApp } from '../../registry/appRegistry';
import {
  FileText,
  GitBranch,
  Calculator,
  Monitor,
  Settings,
  Package,
  Info,
  StickyNote,
  FileIcon,
  LucideIcon
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  'file-text': FileText,
  'git-branch': GitBranch,
  'calculator': Calculator,
  'monitor': Monitor,
  'settings': Settings,
  'package': Package,
  'info': Info,
  'sticky-note': StickyNote,
};

interface TaskbarItemProps {
  window: WindowState;
  isActive: boolean;
  onClick: () => void;
}

export function TaskbarItem({ window, isActive, onClick }: TaskbarItemProps) {
  const app = getApp(window.componentType);
  const iconName = app?.defaultConfig.icon ?? 'package';
  const IconComponent = iconMap[iconName];

  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 px-3 py-1.5 rounded-lg
        transition-all duration-150
        ${isActive
          ? 'bg-white/60 shadow-sm ring-1 ring-white/60'
          : 'hover:bg-black/5'
        }
        ${window.isMinimized ? 'opacity-60' : ''}
      `}
      title={window.title}
    >
      {IconComponent ? (
        <IconComponent className="w-5 h-5 text-gray-700" />
      ) : (
        <FileIcon className="w-5 h-5 text-gray-700" />
      )}
      <span className="text-sm text-gray-800 truncate max-w-[120px]">
        {window.title}
      </span>

      {isActive && (
        <span className="w-1.5 h-1.5 rounded-full bg-accent ml-1" />
      )}
    </button>
  );
}
