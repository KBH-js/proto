import { useTranslation } from '../../i18n';

interface WindowControlsProps {
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  isActive?: boolean;
}

/** macOS-style traffic light buttons (close / minimize / maximize) */
export function WindowControls({
  onClose,
  onMinimize,
  onMaximize,
  isActive = true,
}: WindowControlsProps) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center gap-2 group">
      <button
        onClick={onClose}
        className={`
          w-3 h-3 rounded-full transition-all
          flex items-center justify-center
          ${isActive ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-400'}
          group-hover:after:content-['×'] after:text-[10px] after:font-bold after:text-red-900 after:opacity-0 group-hover:after:opacity-100
        `}
        aria-label={t('window.close')}
      />

      <button
        onClick={onMinimize}
        className={`
          w-3 h-3 rounded-full transition-all
          flex items-center justify-center
          ${isActive ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-gray-400'}
          group-hover:after:content-['−'] after:text-[10px] after:font-bold after:text-yellow-900 after:opacity-0 group-hover:after:opacity-100
        `}
        aria-label={t('window.minimize')}
      />

      <button
        onClick={onMaximize}
        className={`
          w-3 h-3 rounded-full transition-all
          flex items-center justify-center
          ${isActive ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-400'}
          group-hover:after:content-['+'] after:text-[10px] after:font-bold after:text-green-900 after:opacity-0 group-hover:after:opacity-100
        `}
        aria-label={t('window.maximize')}
      />
    </div>
  );
}
