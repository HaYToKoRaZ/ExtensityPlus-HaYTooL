import type { Config } from "tailwindcss";

// Design language: a "breaker panel" for your browser. Rows read like
// physical switches on a panel. The palette is built from the extension
// icon's navy blue, so the popup, options, and profiles pages all read as
// the same product as the icon in the toolbar.
export default {
  darkMode: "class",
  content: ["./index.html", "./options.html", "./profiles.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F6F7FA",
        ink: "#12171F",
        graphite: {
          DEFAULT: "#1A212D",
          soft: "#212936",
          line: "#2E3846",
        },
        line: "#E1E5ED",
        signal: {
          DEFAULT: "#3D557B",
          soft: "#E8ECF4",
          dark: "#8CA3C7",
        },
        warn: {
          DEFAULT: "#D9563A",
          soft: "#FBE9E4",
        },
        ash: {
          50: "#FAFBFC",
          100: "#F0F2F6",
          200: "#E1E5ED",
          300: "#C6CCDA",
          400: "#98A2B8",
          500: "#6D7690",
          600: "#4F5771",
          700: "#38405A",
          800: "#242B3A",
          900: "#161B26",
        },
      },
      fontFamily: {
        display: ["'Space Grotesk Variable'", "'Space Grotesk'", "system-ui", "sans-serif"],
        sans: ["'Inter Variable'", "'Inter'", "system-ui", "sans-serif"],
        mono: ["'IBM Plex Mono'", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      borderRadius: {
        DEFAULT: "10px",
        sm: "7px",
        lg: "14px",
        pill: "999px",
      },
      boxShadow: {
        panel: "0 1px 2px rgba(21, 23, 27, 0.04), 0 8px 24px -12px rgba(21, 23, 27, 0.14)",
        row: "0 1px 0 rgba(21, 23, 27, 0.03)",
      },
      transitionTimingFunction: {
        spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
      keyframes: {
        "pop-in": {
          "0%": { opacity: "0", transform: "translateY(2px) scale(0.98)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        "led-pulse": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.55" },
        },
      },
      animation: {
        "pop-in": "pop-in 160ms cubic-bezier(0.34, 1.56, 0.64, 1)",
        "led-pulse": "led-pulse 1.8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
