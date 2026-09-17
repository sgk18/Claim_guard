import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Strict ClaimGuard Design Palette
        brand: {
          orange: "#F97316", // Primary Accent
          peach: "#FDBA74",  // Supporting Warm Token
          navy: "#0F172A",   // Primary Dark Canvas & Contrast
          slate: "#334155",  // Borders, Secondary Type & Structures
          offwhite: "#F8FAFC", // Clean Ground Surface
          50: "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
          700: "#c2410c",
          800: "#9a3412",
          900: "#7c2d12",
          950: "#431407",
        },
        risk: {
          low: "#10b981",
          medium: "#f59e0b",
          high: "#ef4444",
          critical: "#991b1b",
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        tactile: "0 2px 0 0 rgba(15, 23, 42, 0.08), 0 4px 12px 0 rgba(15, 23, 42, 0.04)",
        clay: "inset 0 1px 1px 0 rgba(255, 255, 255, 0.6), 0 4px 6px -1px rgba(15, 23, 42, 0.08)",
        brutal: "2px 2px 0px 0px #0F172A",
        "brutal-orange": "2px 2px 0px 0px #F97316",
      }
    },
  },
  plugins: [],
};
export default config;
