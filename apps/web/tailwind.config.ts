import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0B0E14",
        surface: {
          DEFAULT: "#121721",
          elevated: "#1A2130",
          border: "#252F42",
        },
        brand: {
          50: "#EEF2FF",
          500: "#4F46E5",
          600: "#4338CA",
        },
        income: {
          DEFAULT: "#10B981",
          light: "rgba(16, 185, 129, 0.15)",
        },
        expense: {
          DEFAULT: "#F43F5E",
          light: "rgba(244, 63, 94, 0.15)",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
