import { useWindowStore } from '../../store/windowStore';
import { Desktop } from '../organisms/Desktop';
import { WindowFrame } from '../organisms/WindowFrame';
import { SnapPreview } from '../organisms/SnapPreview';
import { Taskbar } from '../organisms/Taskbar';

export function WindowManagerLayout() {
  const windows = useWindowStore((state) => state.windows);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black">
      <Desktop />

      {windows.map((win) => (
        <WindowFrame key={win.id} window={win} />
      ))}

      <SnapPreview />

      <Taskbar />
    </div>
  );
}
