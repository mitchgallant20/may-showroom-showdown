import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{ts,tsx,js,jsx,mdx}",
    "./app/**/*.{ts,tsx,js,jsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#05070d",
          900: "#0a0e1a",
          800: "#0f1524",
          700: "#161d31",
          600: "#1f2940",
        },
        bill: {
          DEFAULT: "#1d6cd1",
          light: "#5ea3ff",
          deep: "#0a3a7a",
        },
        sumit: {
          DEFAULT: "#00b8d4",
          light: "#7be8ff",
          deep: "#066b7d",
        },
        gold: {
          DEFAULT: "#ffd24a",
          deep: "#c89a1f",
        },
        ember: {
          DEFAULT: "#ff3d57",
          light: "#ff7a8c",
        },
        line: {
          DEFAULT: "rgba(255,255,255,0.06)",
          strong: "rgba(255,255,255,0.10)",
        },
      },
      fontFamily: {
        display: ["'Barlow Condensed'", "'Bebas Neue'", "Impact", "sans-serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "ui-monospace", "monospace"],
      },
      boxShadow: {
        "glow-bill": "0 0 40px rgba(29, 108, 209, 0.55)",
        "glow-sumit": "0 0 40px rgba(0, 184, 212, 0.6)",
        "glow-gold": "0 0 30px rgba(255, 210, 74, 0.45)",
        "glow-ember": "0 0 40px rgba(255, 61, 87, 0.35)",
        "card": "0 30px 80px rgba(0, 0, 0, 0.6)",
        "portrait": "0 30px 80px rgba(0,0,0,0.6), inset 0 0 80px rgba(0,0,0,0.5)",
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": { filter: "brightness(1)" },
          "50%": { filter: "brightness(1.18)" },
        },
        "blink-dot": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.35" },
        },
        ticker: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        "pulse-glow": "pulse-glow 2.4s ease-in-out infinite",
        "blink-dot": "blink-dot 1.6s ease-in-out infinite",
        ticker: "ticker 60s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
