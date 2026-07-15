import { WindowState } from '../../types/window.types';
import { getApp } from '../../registry/appRegistry';
import { getAppIcon } from '../shared/appIcons';
import { useTranslation, translateAppTitle } from '../../i18n';
import { Package } from 'lucide-react';

interface TaskbarItemProps {
  window: WindowState;
  isActive: boolean;
  onClick: () => void;
}

export function TaskbarItem({ window, isActive, onClick }: TaskbarItemProps) {
  const { t } = useTranslation();
  const app = getApp(window.componentType);
  const IconComponent = getAppIcon(app?.defaultConfig.icon ?? '') ?? Package;
  const title = translateAppTitle(t, window.componentType, window.title);

  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 px-3 py-1.5 rounded-xl flex-shrink-0
        transition-all duration-150
        ${isActive
          ? 'bg-white/70 dark:bg-white/15 shadow-inner ring-1 ring-white/70 dark:ring-white/20'
          : 'hover:bg-white/40 dark:hover:bg-white/10'
        }
        ${window.isMinimized ? 'opacity-60' : ''}
      `}
      title={title}
    >
      <IconComponent className="w-5 h-5 text-gray-700 dark:text-gray-200" />
      <span className="hidden sm:inline text-sm text-gray-800 dark:text-gray-100 truncate max-w-[120px]">
        {title}
      </span>

      {isActive && (
        <span className="w-1.5 h-1.5 rounded-full bg-accent ml-1" />
      )}
    </button>
  );
}
