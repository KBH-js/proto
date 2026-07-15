import NotesApp from './NotesApp';

// Standalone entry for `pnpm dev`. When loaded via Module Federation,
// only NotesApp is exposed and this wrapper is not used.
export default function App() {
  return (
    <div className="min-h-screen bg-background-primary flex items-center justify-center p-4">
      <div className="w-full max-w-md h-[30rem] rounded-xl overflow-hidden shadow-window border border-chrome-border">
        <NotesApp />
      </div>
    </div>
  );
}
