import containerQueries from '@tailwindcss/container-queries';

/** @type {import('tailwindcss').Config} */
export default {
  // Shell theme is toggled by a `dark` class on the shell root
  // (WindowManagerLayout). Host-local apps (About, Resume) are theme-aware
  // and author `dark:` variants that cascade from that root; federated
  // remotes still own their own theme (out of the host's `dark:` scope).
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // macOS system blue — primary accent across the shell
        accent: '#0A84FF',
        // Liquid Glass tint token (see index.css :root/.dark for the value)
        glass: 'var(--glass-tint)',
      },
      backdropBlur: {
        glass: 'var(--glass-blur)',
      },
      boxShadow: {
        glass: 'var(--glass-drop)',
      },
    },
  },
  // Container queries (@container/@lg:…): window content must respond to the
  // WINDOW's width, not the viewport's — a small floating window on a large
  // monitor must not get the wide layout.
  plugins: [containerQueries],
}
