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
        // shadcn compat — kept but overridden via CSS vars
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        // ZeroPrompt brutal palette
        cream:  "#FFF8F0",
        ink:    "#0A0A0A",
        yellow: "#FFE500",
        coral:  "#FF4136",
        cobalt: "#0057FF",
        lime:   "#39FF14",
      },
      fontFamily: {
        syne:    ["var(--font-syne)", "sans-serif"],
        "dm-mono": ["var(--font-dm-mono)", "monospace"],
      },
      borderWidth: {
        "3": "3px",
        "4": "4px",
      },
      boxShadow: {
        // flat offset shadows — the core brutal primitive
        brut:           "4px 4px 0px 0px #0A0A0A",
        "brut-sm":      "2px 2px 0px 0px #0A0A0A",
        "brut-lg":      "6px 6px 0px 0px #0A0A0A",
        "brut-xl":      "8px 8px 0px 0px #0A0A0A",
        // colored variants
        "brut-yellow":  "4px 4px 0px 0px #FFE500",
        "brut-coral":   "4px 4px 0px 0px #FF4136",
        "brut-cobalt":  "4px 4px 0px 0px #0057FF",
        "brut-lime":    "4px 4px 0px 0px #39FF14",
        // hover state — bigger
        "brut-hover":   "6px 6px 0px 0px #0A0A0A",
        // active/pressed state — squished
        "brut-active":  "1px 1px 0px 0px #0A0A0A",
        // none (for removing shadows)
        none: "none",
      },
      borderRadius: {
        // brutalist default: square
        DEFAULT: "0px",
        none:    "0px",
        sm:      "0px",
        md:      "0px",
        lg:      "0px",
        // chunky option
        brut:    "16px",
        full:    "9999px",
      },
      transitionTimingFunction: {
        spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
      keyframes: {
        "brut-in": {
          "0%":   { transform: "translate(4px, 4px)", opacity: "0" },
          "100%": { transform: "translate(0, 0)",     opacity: "1" },
        },
        wiggle: {
          "0%, 100%": { transform: "rotate(-2deg)" },
          "50%":      { transform: "rotate(2deg)" },
        },
        stamp: {
          "0%":   { transform: "scale(1.15) rotate(-3deg)", opacity: "0" },
          "60%":  { transform: "scale(0.97) rotate(1deg)",  opacity: "1" },
          "100%": { transform: "scale(1) rotate(0deg)",     opacity: "1" },
        },
      },
      animation: {
        "brut-in": "brut-in 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) both",
        wiggle:    "wiggle 0.4s ease-in-out",
        stamp:     "stamp 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) both",
      },
    },
  },
  plugins: [],
};

export default config;
