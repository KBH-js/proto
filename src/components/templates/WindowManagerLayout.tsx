import { useWindowStore } from '../../store/windowStore';
import { usePrefsStore } from '../../store/prefsStore';
import { Desktop } from '../organisms/Desktop';
import { WindowFrame } from '../organisms/WindowFrame';
import { SnapPreview } from '../organisms/SnapPreview';
import { Taskbar } from '../organisms/Taskbar';

export function WindowManagerLayout() {
  const windows = useWindowStore((state) => state.windows);
  // Shell theme: a `dark` class here scopes Tailwind's dark variants to the
  // chrome (Desktop/Taskbar/window frames), never leaking into app content.
  const theme = usePrefsStore((state) => state.theme);

  return (
    <div className={`relative w-screen h-screen overflow-hidden bg-black ${theme === 'dark' ? 'dark' : ''}`}>
      <Desktop />

      {windows.map((win) => (
        <WindowFrame key={win.id} window={win} />
      ))}

      <SnapPreview />

      <Taskbar />
    </div>
  );
}
