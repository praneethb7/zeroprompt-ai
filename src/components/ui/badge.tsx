import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  [
    "inline-flex items-center gap-1",
    "font-dm-mono font-medium text-xs uppercase tracking-wider",
    "border-2 border-ink px-2 py-0.5",
    "transition-[box-shadow,transform] duration-100 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
  ].join(" "),
  {
    variants: {
      variant: {
        yellow:  "bg-yellow text-ink shadow-brut-sm",
        coral:   "bg-coral  text-white shadow-brut-sm",
        cobalt:  "bg-cobalt text-white shadow-brut-sm",
        lime:    "bg-lime   text-ink shadow-brut-sm",
        outline: "bg-cream  text-ink shadow-brut-sm",
        ghost:   "bg-transparent text-ink border-ink/30 shadow-none",
        // legacy shadcn aliases
        default:     "bg-yellow text-ink shadow-brut-sm",
        secondary:   "bg-cobalt text-white shadow-brut-sm",
        destructive: "bg-coral text-white shadow-brut-sm",
      },
    },
    defaultVariants: {
      variant: "yellow",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
