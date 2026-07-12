import {
  FileText,
  GitBranch,
  Calculator,
  Monitor,
  Settings,
  Package,
  Info,
  StickyNote,
  LucideIcon,
} from 'lucide-react';

/**
 * Registry icon name → lucide component, shared by desktop icons,
 * taskbar items and window titlebars. New remote apps that use a new
 * icon name must be added here (see CLAUDE.md).
 */
const appIconMap: Record<string, LucideIcon> = {
  'file-text': FileText,
  'git-branch': GitBranch,
  'calculator': Calculator,
  'monitor': Monitor,
  'settings': Settings,
  'package': Package,
  'info': Info,
  'sticky-note': StickyNote,
};

export function getAppIcon(name: string): LucideIcon | undefined {
  return appIconMap[name];
}

/** Tint used on the desktop's icon tiles (light colors on dark wallpaper) */
export function getAppIconColor(name: string): string {
  switch (name) {
    case 'info': return 'text-blue-400';
    case 'file-text': return 'text-red-400';
    case 'git-branch': return 'text-sky-400';
    case 'calculator': return 'text-orange-400';
    case 'monitor': return 'text-blue-400';
    case 'settings': return 'text-gray-300';
    case 'sticky-note': return 'text-yellow-400';
    default: return 'text-white';
  }
}
