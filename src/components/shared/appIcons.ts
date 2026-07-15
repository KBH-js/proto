import {
  FileText,
  GitBranch,
  Calculator,
  Monitor,
  Settings,
  Package,
  Info,
  StickyNote,
  Network,
  Server,
  Palette,
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
  'network': Network,
  'server': Server,
  'palette': Palette,
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
    case 'network': return 'text-emerald-400';
    case 'server': return 'text-violet-400';
    case 'palette': return 'text-pink-400';
    default: return 'text-white';
  }
}
