import type { Config } from "tailwindcss"
import animate from "tailwindcss-animate"

/**
 * Thème repris fidèlement de plan_trail_interactif.html.
 * Palette terre/mousse/ocre, typo Fraunces + Archivo. Pas de rendu shadcn générique.
 */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#16140f",
        bg2: "#1f1c14",
        panel: "#26221a",
        panel2: "#2e2920",
        line: "#3a342a",
        ink: "#f2ede0",
        muted: "#a99e88",
        moss: { DEFAULT: "#7ba05b", dark: "#5c7d3f" },
        ocre: { DEFAULT: "#d98a3d", dark: "#b4691f" },
        rust: "#c2562e",
        sky: "#6fa8c4",
      },
      fontFamily: {
        display: ['"Fraunces"', "serif"],
        sans: ['"Archivo"', "sans-serif"],
      },
      borderRadius: {
        xl: "14px",
        "2xl": "18px",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        fade: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "none" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.25s ease-out",
        "accordion-up": "accordion-up 0.25s ease-out",
        fade: "fade 0.3s ease",
      },
    },
  },
  plugins: [animate],
} satisfies Config
