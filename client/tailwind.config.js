/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#0b0a08",
          900: "#121009",
          875: "#15130e",
          850: "#191612",
          800: "#1e1a15",
          700: "#2a251e",
          600: "#3b342a",
        },
        cream: "#f2ede3",
        gold: {
          200: "#f3e3bd",
          300: "#e9cf93",
          400: "#ddb86a",
          500: "#d2a54c",
          600: "#b3873a",
          700: "#8f6a2c",
        },
        board: {
          light: "#f0d9b5",
          dark: "#a97c50",
        },
      },
      fontFamily: {
        display: ['"Instrument Serif"', "Georgia", "serif"],
        sans: ['"Inter"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
      boxShadow: {
        glow: "0 0 40px rgba(210, 165, 76, 0.25)",
        "glow-sm": "0 0 18px rgba(210, 165, 76, 0.3)",
        panel: "0 24px 60px -20px rgba(0, 0, 0, 0.7)",
        board: "0 30px 80px -20px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255,255,255,0.06)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.55" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) both",
        shimmer: "shimmer 2.5s linear infinite",
        "pulse-soft": "pulse-soft 1.6s ease-in-out infinite",
      },
    },
  },
  plugins: [require('tailwind-scrollbar')],
}
