"use client"

import { cn } from "@/lib/utils"

export interface ChoiceOption<T> {
  value: T
  label: string
  description?: string
}

interface Props<T> {
  title: string
  subtitle?: string
  value: unknown
  options: ChoiceOption<T>[]
  onChange: (value: T) => void
  onNext: () => void
  autoAdvance?: boolean
}

/**
 * Generic single-choice step for wizard questions with 2–4 options.
 * If autoAdvance is true, selecting an option advances to the next step automatically.
 */
export function ChoiceStep<T>({
  title,
  subtitle,
  value,
  options,
  onChange,
  onNext,
  autoAdvance = false,
}: Props<T>) {
  const handleSelect = (v: T) => {
    onChange(v)
    if (autoAdvance) {
      // Slight delay so the selection state is visible before transition
      setTimeout(onNext, 220)
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="text-center">
        <h2 className="font-display text-2xl sm:text-3xl text-[var(--color-text)] mb-2">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {options.map((opt) => {
          const selected = value === opt.value
          return (
            <button
              key={String(opt.value)}
              type="button"
              onClick={() => handleSelect(opt.value)}
              className={cn(
                "w-full rounded-lg border-2 px-5 py-4 text-right transition-all duration-150",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                selected
                  ? "border-primary bg-[var(--color-pending-surface)]"
                  : "border-border bg-surface-raised hover:border-[var(--color-muted-fg)]"
              )}
              aria-pressed={selected}
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "mt-0.5 h-5 w-5 shrink-0 rounded-full border-2 transition-colors",
                    selected
                      ? "border-primary bg-primary"
                      : "border-[var(--color-border)] bg-surface-raised"
                  )}
                  aria-hidden
                >
                  {selected && (
                    <div className="h-full w-full flex items-center justify-center">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div
                    className={cn(
                      "font-medium text-base",
                      selected ? "text-[var(--color-text)]" : "text-[var(--color-text)]"
                    )}
                  >
                    {opt.label}
                  </div>
                  {opt.description && (
                    <div className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      {opt.description}
                    </div>
                  )}
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
