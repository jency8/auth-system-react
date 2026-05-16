/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Syne'", "sans-serif"],
        body:    ["'DM Sans'", "sans-serif"],
        mono:    ["'JetBrains Mono'", "monospace"],
      },
      colors: {
        obsidian: {
          50:  "#f0f0f5",
          100: "#e0e0eb",
          200: "#c1c1d6",
          300: "#9191b8",
          400: "#6b6b99",
          500: "#4d4d7a",
          600: "#3a3a5c",
          700: "#27273f",
          800: "#16162b",
          900: "#0a0a1a",
          950: "#050510",
        },
        neon: {
          cyan:   "#00f5ff",
          green:  "#39ff14",
          purple: "#bf5af2",
          pink:   "#ff2d78",
        },
      },
    },
  },
  plugins: [],
};
