import { forwardRef, type InputHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-")
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-[var(--color-text)]">
            {label}
            {props.required && <span className="text-[oklch(50%_0.18_25)] mr-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "h-10 w-full rounded-md border bg-surface-raised px-3 text-sm",
            "placeholder:text-muted-foreground transition-colors duration-150",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
            error
              ? "border-[oklch(50%_0.18_25)] focus:ring-[oklch(50%_0.18_25_/_0.3)]"
              : "border-border hover:border-[var(--color-muted-fg)]",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-[oklch(50%_0.18_25)]" role="alert">{error}</p>}
        {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
    )
  }
)
Input.displayName = "Input"
