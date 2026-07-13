import { useTranslation } from '../../i18n';

interface WindowControlsProps {
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  isActive?: boolean;
}

/**
 * Aqua-style traffic lights (close / minimize / maximize). Glossy gel
 * gumdrops that reveal a crisp inner glyph on hover of the cluster — the
 * glyph is a centered SVG so it stays pixel-aligned at any zoom.
 */
export function WindowControls({
  onClose,
  onMinimize,
  onMaximize,
  isActive = true,
}: WindowControlsProps) {
  const { t } = useTranslation();

  return (
    <div className="aqua-traffic-cluster flex items-center gap-2">
      <button
        onClick={onClose}
        className={`aqua-traffic ${isActive ? 'aqua-traffic--close' : 'aqua-traffic--muted'}`}
        aria-label={t('window.close')}
      >
        <svg className="aqua-traffic__glyph" viewBox="0 0 10 10" fill="none">
          <path
            d="M3 3 L7 7 M7 3 L3 7"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </button>

      <button
        onClick={onMinimize}
        className={`aqua-traffic ${isActive ? 'aqua-traffic--min' : 'aqua-traffic--muted'}`}
        aria-label={t('window.minimize')}
      >
        <svg className="aqua-traffic__glyph" viewBox="0 0 10 10" fill="none">
          <path d="M2.5 5 L7.5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </button>

      <button
        onClick={onMaximize}
        className={`aqua-traffic ${isActive ? 'aqua-traffic--max' : 'aqua-traffic--muted'}`}
        aria-label={t('window.maximize')}
      >
        <svg className="aqua-traffic__glyph" viewBox="0 0 10 10" fill="none">
          <path
            d="M5 2.5 L5 7.5 M2.5 5 L7.5 5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
}
