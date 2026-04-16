"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import type { TaskStatus } from "@/types"

interface Props {
  taskId: string
  initialStatus: TaskStatus
}

const OPTIONS: { value: TaskStatus; label: string; className: string }[] = [
  { value: "PENDING",     label: "ממתין",   className: "data-[active=true]:bg-[var(--color-pending-surface)] data-[active=true]:text-[var(--color-pending)] data-[active=true]:border-[var(--color-pending)]" },
  { value: "IN_PROGRESS", label: "בתהליך",  className: "data-[active=true]:bg-[var(--color-warning-surface)] data-[active=true]:text-[var(--color-warning)] data-[active=true]:border-[var(--color-warning)]" },
  { value: "DONE",        label: "הושלם",   className: "data-[active=true]:bg-[var(--color-done-surface)] data-[active=true]:text-[var(--color-done)] data-[active=true]:border-[var(--color-done)]" },
  { value: "SKIPPED",     label: "דולג",    className: "data-[active=true]:bg-muted data-[active=true]:text-muted-foreground data-[active=true]:border-[var(--color-muted-fg)]" },
]

export function StatusToggle({ taskId, initialStatus }: Props) {
  const router = useRouter()
  const [status, setStatus] = useState<TaskStatus>(initialStatus)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const update = async (next: TaskStatus) => {
    if (next === status || isPending) return
    const previous = status
    setStatus(next)
    setError(null)

    const res = await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    })

    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string }
      setStatus(previous)
      setError(body.error ?? "שגיאה בעדכון הסטטוס")
      return
    }

    startTransition(() => router.refresh())
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">
        סטטוס המשימה
      </div>
      <div
        role="radiogroup"
        className="inline-flex flex-wrap gap-1.5 p-1 rounded-lg bg-muted border border-border"
      >
        {OPTIONS.map((opt) => {
          const active = status === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={active}
              data-active={active}
              onClick={() => update(opt.value)}
              disabled={isPending}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm font-medium border-2 border-transparent",
                "bg-transparent text-muted-foreground",
                "transition-all duration-150",
                "hover:text-[var(--color-text)] disabled:opacity-60 disabled:cursor-wait",
                opt.className
              )}
            >
              {opt.label}
            </button>
          )
        })}
      </div>
      {error && (
        <p role="alert" className="text-xs text-[oklch(50%_0.18_25)]">
          {error}
        </p>
      )}
    </div>
  )
}
