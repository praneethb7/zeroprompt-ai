import * as React from "react"
import { cn } from "@/lib/utils"

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-[100px] w-full bg-cream text-ink px-4 py-3",
        "font-dm-mono text-sm placeholder:text-ink/40",
        "border-3 border-ink shadow-brut-sm",
        "resize-y",
        "transition-[transform,box-shadow] duration-100 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
        "focus-visible:outline-none focus-visible:shadow-brut focus-visible:-translate-x-px focus-visible:-translate-y-px",
        "disabled:cursor-not-allowed disabled:opacity-40",
        className
      )}
      {...props}
    />
  )
)
Textarea.displayName = "Textarea"

export { Textarea }
