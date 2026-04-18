"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

interface Props {
  /** Label shown above the value (e.g., "תעודת זהות"). */
  label: string
  /** The value to display and copy. Null = empty state. */
  value: string | null | undefined
  /** If not provided, shows an inline "הוסף ב-/settings" hint. */
  fallbackMessage?: string
  className?: string
}

/**
 * A read-only field with a one-click copy button. Used on task pages to
 * let the user paste their pre-filled profile data into government forms.
 */
export function CopyField({ label, value, fallbackMessage, className }: Props) {
  const [copied, setCopied] = useState(false)
  const empty = !value || value.trim().length === 0

  const copy = async () => {
    if (empty) return
    try {
      await navigator.clipboard.writeText(value!)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // silent — clipboard API requires secure context or permission
    }
  }

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <span className="text-xs text-muted-foreground font-medium">{label}</span>
      {empty ? (
        <span className="text-sm text-muted-foreground italic">
          {fallbackMessage ?? "לא מולא בפרופיל"}
        </span>
      ) : (
        <button
          type="button"
          onClick={copy}
          className={cn(
            "flex items-center justify-between gap-2 text-right",
            "rounded-md border border-border bg-surface-raised px-3 py-2",
            "text-sm text-[var(--color-text)] font-medium",
            "hover:border-[var(--color-muted-fg)] transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-ring"
          )}
          aria-label={`העתק ${label}`}
        >
          <span className="truncate" dir={label === "תאריך לידה" ? "rtl" : "ltr"}>{value}</span>
          <span
            className={cn(
              "text-xs shrink-0 transition-colors",
              copied ? "text-[var(--color-highlight)]" : "text-muted-foreground"
            )}
          >
            {copied ? "✓ הועתק" : "העתק"}
          </span>
        </button>
      )}
    </div>
  )
}
