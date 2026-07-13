import { WindowControls } from '../molecules/WindowControls';
import { isDevelopment } from '../../config/portfolio.config';
import { getAppIcon } from '../shared/appIcons';
import { useTranslation } from '../../i18n';

interface TitleBarProps {
  title: string;
  isActive: boolean;
  isMaximized: boolean;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  /** Whether this window contains a remote micro-frontend */
  isRemote?: boolean;
  /** Registry icon name shown next to the title */
  icon?: string;
}

/** CSS class name used by react-rnd for drag handle */
export const DRAG_HANDLE_CLASS = 'window-drag-handle';

export function TitleBar({
  title,
  isActive,
  isMaximized,
  onClose,
  onMinimize,
  onMaximize,
  isRemote = false,
  icon,
}: TitleBarProps) {
  const { t } = useTranslation();

  const handleDoubleClick = () => {
    onMaximize();
  };

  const IconComponent = icon ? getAppIcon(icon) : undefined;

  const remoteBadgeLabel = isDevelopment ? 'MFE:DEV' : 'MFE';
  const remoteTooltip = isDevelopment
    ? t('window.mfeDevTooltip')
    : t('window.mfeProdTooltip');

  return (
    <div
      className={`
        ${DRAG_HANDLE_CLASS}
        flex items-center h-9 px-3
        select-none
        border-b border-white/25 dark:border-white/10
        ${isActive ? 'bg-white/15 dark:bg-white/[0.06]' : 'bg-white/5 dark:bg-transparent'}
        ${!isMaximized ? 'cursor-move' : 'cursor-default'}
      `}
      onDoubleClick={handleDoubleClick}
    >
      <div className="flex-shrink-0">
        <WindowControls
          onClose={onClose}
          onMinimize={onMinimize}
          onMaximize={onMaximize}
          isActive={isActive}
        />
      </div>

      {isRemote && (
        <div className="flex-shrink-0 ml-2">
          <span
            className={`
              inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider
              ${isActive 
                ? 'bg-cyan-500 text-white shadow-sm shadow-cyan-500/50' 
                : 'bg-cyan-600/50 text-cyan-100'
              }
            `}
            title={remoteTooltip}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            {remoteBadgeLabel}
          </span>
        </div>
      )}

      <div className="flex-1 flex items-center justify-center gap-1.5 min-w-0">
        {IconComponent && (
          <IconComponent
            className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-gray-600 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'}`}
          />
        )}
        <span
          className={`
            lg-text text-sm font-medium truncate
            ${isActive ? 'text-gray-800 dark:text-gray-50' : 'text-gray-500 dark:text-gray-300'}
          `}
        >
          {title}
        </span>
      </div>

      {/* Spacer for balance (same width as controls + badge space) */}
      <div className={`flex-shrink-0 ${isRemote ? 'w-[100px]' : 'w-[52px]'}`} />
    </div>
  );
}
