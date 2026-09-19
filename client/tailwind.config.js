/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        game: {
          dark: "#0F172A",
          card: "#1E293B",
          accent: "#8B5CF6",
          hover: "#7C3AED",
          red: "#EF4444",
          green: "#10B981",
          yellow: "#F59E0B",
          blue: "#3B82F6",
        }
      },
      fontFamily: {
        game: ['"Outfit"', '"Inter"', 'sans-serif'],
      },
      animation: {
        'bounce-short': 'bounce 0.5s ease-in-out 2',
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
