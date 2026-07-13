import { useSnapPreviewStore } from '../../store/snapPreviewStore';
import { getSnapRect, getViewport } from '../../utils/windowGeometry';
import { TASKBAR_Z_INDEX } from '../../types/window.types';

/**
 * Translucent overlay showing where a dragged window will land when
 * dropped on the armed snap zone. Sole subscriber of snapPreviewStore,
 * so drag-time zone changes re-render only this component.
 */
export function SnapPreview() {
  const zone = useSnapPreviewStore((state) => state.zone);

  if (!zone) {
    return null;
  }

  const { position, size } = getSnapRect(zone, getViewport());

  return (
    <div
      className="
        absolute pointer-events-none
        rounded-2xl
        bg-white/20 backdrop-blur-sm backdrop-saturate-150
        border-2 border-accent/60
        ring-1 ring-inset ring-white/50
        transition-all duration-150 ease-out
      "
      style={{
        left: position.x,
        top: position.y,
        width: size.w,
        height: size.h,
        zIndex: TASKBAR_Z_INDEX - 1,
      }}
    />
  );
}
