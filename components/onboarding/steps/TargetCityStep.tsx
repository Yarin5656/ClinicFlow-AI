"use client"

import { useEffect, useRef } from "react"

interface Props {
  value: unknown
  onChange: (value: unknown) => void
  onNext: () => void
}

const COMMON_CITIES = [
  "תל אביב",
  "ירושלים",
  "חיפה",
  "ראשון לציון",
  "פתח תקווה",
  "באר שבע",
  "רמת גן",
  "חולון",
  "רחובות",
  "הרצליה",
]

export function TargetCityStep({ value, onChange, onNext }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const cityValue = typeof value === "string" ? value : ""

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h2 className="font-display text-2xl sm:text-3xl text-[var(--color-text)] mb-2">
          לאיזו עיר אתה עובר?
        </h2>
        <p className="text-sm text-muted-foreground">
          זה חשוב לנו כדי להתאים את תהליך הארנונה לעירייה המתאימה
        </p>
      </div>

      <input
        ref={inputRef}
        type="text"
        value={cityValue}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onNext()
        }}
        placeholder="לדוגמה: רמת גן"
        className="h-14 w-full rounded-lg border-2 border-border bg-surface-raised px-4 text-lg text-center text-[var(--color-text)] focus:outline-none focus:border-accent transition-colors"
        required
      />

      <div className="flex flex-wrap justify-center gap-2">
        {COMMON_CITIES.map((city) => {
          const active = city === cityValue
          return (
            <button
              key={city}
              type="button"
              onClick={() => onChange(city)}
              className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                active
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-surface-raised text-muted-foreground border-border hover:border-[var(--color-muted-fg)] hover:text-[var(--color-text)]"
              }`}
            >
              {city}
            </button>
          )
        })}
      </div>
    </div>
  )
}
