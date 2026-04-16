"use client"

import { useEffect, useRef } from "react"

interface Props {
  value: unknown
  onChange: (value: unknown) => void
  onNext: () => void
}

export function MoveDateStep({ value, onChange, onNext }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const today = new Date().toISOString().split("T")[0]

  return (
    <div className="flex flex-col gap-6 text-center">
      <div>
        <h2 className="font-display text-2xl sm:text-3xl text-[var(--color-text)] mb-2">
          מתי אתה עובר דירה?
        </h2>
        <p className="text-sm text-muted-foreground">
          נעזור לתכנן את הלו"ז ולשלוח תזכורות לפני המעבר
        </p>
      </div>

      <input
        ref={inputRef}
        type="date"
        value={typeof value === "string" ? value : ""}
        min={today}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onNext()
        }}
        className="h-14 w-full max-w-xs mx-auto rounded-lg border-2 border-border bg-surface-raised px-4 text-lg text-center text-[var(--color-text)] focus:outline-none focus:border-accent transition-colors"
        required
      />
    </div>
  )
}
