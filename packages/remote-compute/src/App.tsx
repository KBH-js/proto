import { useState } from 'react';
import ComputeApp from './ComputeApp';

/**
 * Standalone entry wrapper (used by `pnpm dev`). When loaded via Module
 * Federation only ComputeApp is exposed and this wrapper is not used.
 *
 * The floating toggle flips a `dark` class on <html> so the theme behavior can
 * be previewed standalone — inside the host, the shell drives that class.
 */
export default function App() {
  const [dark, setDark] = useState(false);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
  };

  return (
    <div className="h-full w-full">
      <button
        onClick={toggle}
        className="fixed right-3 top-3 z-50 rounded-md border border-slate-300 bg-white/80 px-2.5 py-1 text-xs font-medium text-slate-700 shadow-sm backdrop-blur dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-200"
      >
        {dark ? 'Light' : 'Dark'}
      </button>
      <ComputeApp />
    </div>
  );
}
