"use client"

import { useEffect } from "react"

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center" dir="rtl">
      <p className="text-4xl">⚠️</p>
      <h2 className="font-display text-xl font-bold text-[var(--color-text)]">משהו השתבש</h2>
      <p className="text-sm text-[var(--color-muted-fg)] max-w-xs">
        אירעה שגיאה בטעינת העמוד. אפשר לנסות שוב.
      </p>
      <button
        onClick={reset}
        className="px-5 py-2 rounded-lg text-sm font-semibold text-white"
        style={{ background: "var(--color-highlight)" }}
      >
        נסה שוב
      </button>
    </div>
  )
}
