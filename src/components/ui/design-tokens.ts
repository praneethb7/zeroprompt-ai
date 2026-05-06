/**
 * ZeroPrompt Design System — Brutalist × Memphis × Zine
 *
 * Rules:
 *   - No gradients. No glass. No blur. No purple.
 *   - Every interactive element must have a solid offset shadow.
 *   - Hover = lift (-2px, -2px) + bigger shadow.
 *   - Active/pressed = sink (+2px, +2px) + smaller shadow.
 *   - Borders are always 3–4px solid ink (#0A0A0A).
 *   - Typography: Syne 800 for headings, DM Mono for labels/code.
 */

export const colors = {
  cream:  "#FFF8F0",
  ink:    "#0A0A0A",
  yellow: "#FFE500",
  coral:  "#FF4136",
  cobalt: "#0057FF",
  lime:   "#39FF14",
  white:  "#FFFFFF",
} as const;

export const shadows = {
  /** Standard offset shadow — default interactive state */
  brut:    "4px 4px 0px 0px #0A0A0A",
  brutSm:  "2px 2px 0px 0px #0A0A0A",
  brutLg:  "6px 6px 0px 0px #0A0A0A",
  brutXl:  "8px 8px 0px 0px #0A0A0A",
  /** Hover state — element lifts, shadow grows */
  hover:   "6px 6px 0px 0px #0A0A0A",
  /** Active/pressed — element sinks */
  active:  "1px 1px 0px 0px #0A0A0A",
  /** Colored shadow variants */
  yellow:  "4px 4px 0px 0px #FFE500",
  coral:   "4px 4px 0px 0px #FF4136",
  cobalt:  "4px 4px 0px 0px #0057FF",
  lime:    "4px 4px 0px 0px #39FF14",
  none:    "none",
} as const;

export const borders = {
  ink:   "3px solid #0A0A0A",
  ink4:  "4px solid #0A0A0A",
  ink2:  "2px solid #0A0A0A",
  yellow:"3px solid #FFE500",
  coral: "3px solid #FF4136",
  cobalt:"3px solid #0057FF",
  lime:  "3px solid #39FF14",
  dashed:"3px dashed #0A0A0A",
} as const;

export const radius = {
  none:  "0px",
  brut:  "16px",
  full:  "9999px",
} as const;

export const fonts = {
  heading: "var(--font-syne), sans-serif",
  mono:    "var(--font-dm-mono), monospace",
} as const;

/** Tailwind class sets for common patterns */
export const tw = {
  brutCard:    "border-3 border-ink bg-cream shadow-brut",
  brutInput:   "border-3 border-ink bg-cream shadow-brut-sm focus:shadow-brut font-dm-mono",
  brutLift:    "transition-all duration-100 ease-spring hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brut-lg active:translate-x-0.5 active:translate-y-0.5 active:shadow-brut-sm",
  headingXl:   "font-syne font-extrabold text-5xl tracking-tight",
  headingLg:   "font-syne font-extrabold text-3xl tracking-tight",
  label:       "font-dm-mono text-xs font-medium uppercase tracking-widest",
} as const;

export type ColorKey  = keyof typeof colors;
export type ShadowKey = keyof typeof shadows;
