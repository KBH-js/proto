import { MockHostProvider } from './MockHostProvider';
import NotesApp from './NotesApp';

/**
 * Standalone App Wrapper
 *
 * Wraps NotesApp with the MockHostProvider for standalone development mode.
 * When loaded via Module Federation, only NotesApp is exposed.
 */
export default function App() {
  return (
    <MockHostProvider>
      <div className="min-h-screen bg-background-primary flex items-center justify-center p-4">
        {/* Notes container with window-like framing */}
        <div className="w-full max-w-md h-[480px] rounded-xl overflow-hidden shadow-window border border-chrome-border">
          <NotesApp />
        </div>
      </div>
    </MockHostProvider>
  );
}
