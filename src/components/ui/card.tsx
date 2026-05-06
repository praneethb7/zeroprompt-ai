import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Brutalist card — thick ink border, flat offset shadow, cream background.
 *
 * Accent stripe variants:  stripe="yellow" | "coral" | "cobalt" | "lime"
 * Lift on hover:           set hover prop to true for the brut-lift effect
 *
 * Shadow convention:
 *   default → 4px 4px 0 #0A0A0A
 *   hover   → element translates -2px, -2px; shadow 6px 6px
 *   active  → +2px, +2px; shadow 1px 1px
 */

type AccentStripe = "yellow" | "coral" | "cobalt" | "lime" | "none"

const stripeMap: Record<AccentStripe, string> = {
  yellow: "border-t-[6px] border-t-yellow",
  coral:  "border-t-[6px] border-t-coral",
  cobalt: "border-t-[6px] border-t-cobalt",
  lime:   "border-t-[6px] border-t-lime",
  none:   "",
}

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  stripe?: AccentStripe
  hover?:  boolean
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, stripe = "none", hover = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        // Structural
        "relative bg-cream text-ink",
        // Thick border + flat shadow
        "border-3 border-ink shadow-brut",
        // Stripe
        stripeMap[stripe],
        // Tactile lift (opt-in)
        hover && [
          "transition-[transform,box-shadow] duration-[120ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]",
          "cursor-pointer",
          "hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brut-lg",
          "active:translate-x-0.5 active:translate-y-0.5 active:shadow-brut-sm",
        ],
        className
      )}
      {...props}
    />
  )
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col gap-1.5 p-5 pb-3", className)}
      {...props}
    />
  )
)
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn(
        "font-syne font-extrabold text-xl leading-tight tracking-tight text-ink",
        className
      )}
      {...props}
    />
  )
)
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn(
        "font-dm-mono text-sm text-ink/60 leading-relaxed",
        className
      )}
      {...props}
    />
  )
)
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("p-5 pt-0", className)}
      {...props}
    />
  )
)
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex items-center gap-3 p-5 pt-0",
        "border-t-2 border-t-ink/10 mt-2",
        className
      )}
      {...props}
    />
  )
)
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
