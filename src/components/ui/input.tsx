import * as React from "react"
import { cn } from "@/lib/utils"

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      className={cn(
        "flex h-11 w-full bg-cream text-ink px-4 py-2.5",
        "font-dm-mono text-sm placeholder:text-ink/40",
        "border-3 border-ink shadow-brut-sm",
        "transition-[transform,box-shadow] duration-100 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
        "focus-visible:outline-none focus-visible:shadow-brut focus-visible:-translate-x-px focus-visible:-translate-y-px",
        "disabled:cursor-not-allowed disabled:opacity-40",
        "file:border-0 file:bg-transparent file:font-dm-mono file:text-sm",
        className
      )}
      {...props}
    />
  )
)
Input.displayName = "Input"

export { Input }
