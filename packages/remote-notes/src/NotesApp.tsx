import { useEffect, useRef, useState } from 'react';
// CSS must be imported by the exposed module itself so it is part of the
// federated module graph and gets injected when the host loads this app.
import './index.css';

/**
 * Notes App Component
 *
 * A minimal notepad with automatic localStorage persistence.
 * Designed to be consumed by the host app via Module Federation,
 * but can also run standalone for development/testing.
 */

const STORAGE_KEY = 'proto-notes:content';
const SAVE_DEBOUNCE_MS = 400;

type SaveState = 'saved' | 'saving';

export default function NotesApp() {
  const [content, setContent] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) ?? '';
    } catch {
      return '';
    }
  });
  const [saveState, setSaveState] = useState<SaveState>('saved');
  const saveTimerRef = useRef<number | undefined>(undefined);

  // Debounced persistence: mark as saving on change, write after quiet period
  useEffect(() => {
    return () => window.clearTimeout(saveTimerRef.current);
  }, []);

  const handleChange = (value: string) => {
    setContent(value);
    setSaveState('saving');
    window.clearTimeout(saveTimerRef.current);
    saveTimerRef.current = window.setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, value);
      } catch {
        // Storage full/unavailable — keep in-memory content
      }
      setSaveState('saved');
    }, SAVE_DEBOUNCE_MS);
  };

  return (
    <div className="flex flex-col h-full w-full bg-background-primary">
      {/* Editor */}
      <textarea
        className="flex-1 w-full resize-none bg-background-primary text-foreground-primary
                   placeholder-foreground-tertiary p-4 text-base leading-relaxed
                   focus:outline-none font-sans"
        placeholder="Write something... (saved automatically)"
        value={content}
        onChange={(e) => handleChange(e.target.value)}
        spellCheck={false}
      />

      {/* Status bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-background-secondary text-xs text-foreground-secondary select-none">
        <span>{content.length} chars</span>
        <span className={saveState === 'saved' ? 'text-success' : 'text-warning'}>
          {saveState === 'saved' ? '● Saved' : '○ Saving...'}
        </span>
      </div>
    </div>
  );
}
