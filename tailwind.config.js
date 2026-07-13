/** @type {import('tailwindcss').Config} */
export default {
  // Shell theme is toggled by a `dark` class on the shell root
  // (WindowManagerLayout). App/remote surfaces author no `dark:` variants,
  // which keeps the light/dark split scoped to the shell chrome.
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
      },
    },
  },
  plugins: [],
}
