"use client"

import { useEffect, useRef, useState } from "react"

interface Props {
  taskId: string
  initialNotes: string
}

type SaveState = "idle" | "saving" | "saved" | "error"

export function TaskNotes({ taskId, initialNotes }: Props) {
  const [value, setValue] = useState(initialNotes)
  const [state, setState] = useState<SaveState>("idle")
  const lastSaved = useRef(initialNotes)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Debounce auto-save at 800ms after last keystroke
  useEffect(() => {
    if (value === lastSaved.current) {
      setState("idle")
      return
    }
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(async () => {
      setState("saving")
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: value }),
      })
      if (res.ok) {
        lastSaved.current = value
        setState("saved")
        setTimeout(() => setState("idle"), 1500)
      } else {
        setState("error")
      }
    }, 800)

    return () => {
      if (timer.current) clearTimeout(timer.current)
    }
  }, [value, taskId])

  const statusLabel: Record<SaveState, { text: string; color: string }> = {
    idle:    { text: "",                       color: "" },
    saving:  { text: "שומר...",                color: "text-muted-foreground" },
    saved:   { text: "✓ נשמר",                 color: "text-[var(--color-done)]" },
    error:   { text: "שגיאה בשמירה",           color: "text-[oklch(50%_0.18_25)]" },
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between">
        <label htmlFor={`notes-${taskId}`} className="text-sm font-medium text-[var(--color-text)]">
          הערות אישיות
        </label>
        <span className={`text-xs ${statusLabel[state].color}`}>{statusLabel[state].text}</span>
      </div>
      <textarea
        id={`notes-${taskId}`}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={3}
        placeholder="כל מה שחשוב לזכור למשימה הזו..."
        className="w-full rounded-md border border-border bg-surface-raised px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-y min-h-[80px]"
      />
    </div>
  )
}
