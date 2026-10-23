/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  corePlugins: {
    preflight: false, // 🔥 Ye line zaroori hai
  },
  theme: {
    extend: {},
  },
  plugins: [],
}