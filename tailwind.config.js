/** @type {import('tailwindcss').Config} */
export default {
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
