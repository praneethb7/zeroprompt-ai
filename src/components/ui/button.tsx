import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/**
 * Brutalist button — thick borders, solid offset shadow, physical press feedback.
 *
 * Hover:  translate(-2px, -2px)  +  shadow grows to 6×6
 * Active: translate(+2px, +2px)  +  shadow shrinks to 1×1
 *
 * Variants  → yellow (primary) | coral (danger) | cobalt | lime | ghost | outline
 * Sizes     → sm | default | lg | icon
 * Shape     → square (default) | rounded (brut-radius, 16px)
 */

const buttonVariants = cva(
  // Base — layout, typography, transitions
  [
    "relative inline-flex items-center justify-center gap-2",
    "font-dm-mono font-medium text-sm uppercase tracking-wider",
    "border-3 border-ink",
    "select-none whitespace-nowrap",
    "disabled:pointer-events-none disabled:opacity-40",
    "transition-[transform,box-shadow] duration-[120ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2",
    // Hover lifts, active sinks — CSS-only, framer-motion layers on top for page animations
    "hover:-translate-x-0.5 hover:-translate-y-0.5",
    "active:translate-x-0.5 active:translate-y-0.5",
  ].join(" "),
  {
    variants: {
      variant: {
        /** Primary — electric yellow, black text */
        yellow: [
          "bg-yellow text-ink",
          "shadow-brut hover:shadow-brut-hover active:shadow-brut-active",
        ],
        /** Danger — coral red, white text */
        coral: [
          "bg-coral text-white",
          "shadow-brut hover:shadow-brut-hover active:shadow-brut-active",
        ],
        /** Info — cobalt blue, white text */
        cobalt: [
          "bg-cobalt text-white",
          "shadow-brut hover:shadow-brut-hover active:shadow-brut-active",
        ],
        /** Accent — neon lime, black text */
        lime: [
          "bg-lime text-ink",
          "shadow-brut hover:shadow-brut-hover active:shadow-brut-active",
        ],
        /** Outline — transparent fill, ink border + shadow */
        outline: [
          "bg-cream text-ink",
          "shadow-brut hover:shadow-brut-hover active:shadow-brut-active",
        ],
        /** Ghost — no shadow, no fill; border appears on hover */
        ghost: [
          "border-transparent shadow-none bg-transparent text-ink",
          "hover:bg-yellow/20 hover:border-ink hover:shadow-brut-sm",
          "active:bg-yellow/40",
        ],
        /** Inverted — ink bg, cream text (for dark surfaces) */
        invert: [
          "bg-ink text-cream border-ink",
          "shadow-brut-yellow hover:shadow-[6px_6px_0px_0px_#FFE500] active:shadow-[1px_1px_0px_0px_#FFE500]",
        ],
      },
      size: {
        sm:      "h-8  px-3   text-xs",
        default: "h-11 px-5   text-sm",
        lg:      "h-14 px-8   text-base",
        icon:    "h-11 w-11   p-0",
        "icon-sm":"h-8 w-8    p-0",
      },
      shape: {
        square:  "rounded-none",
        rounded: "rounded-[16px]",
        pill:    "rounded-full",
      },
    },
    defaultVariants: {
      variant: "yellow",
      size:    "default",
      shape:   "square",
    },
  }
)

export type ButtonVariant = "yellow" | "coral" | "cobalt" | "lime" | "outline" | "ghost" | "invert"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, shape, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, shape, className }))}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
