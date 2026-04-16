"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

export interface ReminderItemData {
  id: string
  message: string
  scheduledAt: Date | string
  seen: boolean
  task: {
    id: string
    workflowStep: { title: string }
  } | null
}

interface Props {
  reminder: ReminderItemData
}

function formatWhen(value: Date | string): string {
  const date = new Date(value)
  const diff = date.getTime() - Date.now()
  const days = Math.round(diff / (1000 * 60 * 60 * 24))

  const base = date.toLocaleString("he-IL", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  })

  if (days === 0) return `היום · ${base.split("· ").pop() ?? base}`
  if (days === 1) return `מחר · ${date.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" })}`
  if (days === -1) return `אתמול · ${date.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" })}`
  return base
}

export function ReminderItem({ reminder }: Props) {
  const router = useRouter()
  const [busy, setBusy] = useState<"seen" | "delete" | null>(null)
  const scheduledTime = new Date(reminder.scheduledAt).getTime()
  const isDue = scheduledTime <= Date.now()
  const isOverdue = isDue && !reminder.seen

  const markSeen = async () => {
    setBusy("seen")
    const res = await fetch(`/api/reminders/${reminder.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ seen: true }),
    })
    if (res.ok) router.refresh()
    else setBusy(null)
  }

  const remove = async () => {
    if (!confirm("למחוק את התזכורת?")) return
    setBusy("delete")
    const res = await fetch(`/api/reminders/${reminder.id}`, { method: "DELETE" })
    if (res.ok) router.refresh()
    else setBusy(null)
  }

  return (
    <li
      className={cn(
        "rounded-lg border p-4 flex items-start gap-3 transition-colors",
        isOverdue
          ? "border-[var(--color-warning)] bg-[var(--color-warning-surface)]"
          : reminder.seen
            ? "border-border bg-surface opacity-70"
            : "border-border bg-surface-raised"
      )}
    >
      <div
        className={cn(
          "mt-0.5 h-8 w-8 shrink-0 rounded-full flex items-center justify-center text-base",
          isOverdue
            ? "bg-[var(--color-warning)] text-white"
            : reminder.seen
              ? "bg-muted text-muted-foreground"
              : "bg-[var(--color-pending-surface)] text-[var(--color-pending)]"
        )}
        aria-hidden
      >
        {reminder.seen ? "✓" : "🔔"}
      </div>

      <div className="flex-1 min-w-0">
        <div className={cn("text-sm font-medium mb-1", reminder.seen && "line-through text-muted-foreground")}>
          {reminder.message}
        </div>
        <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
          <span className={cn(isOverdue && "font-semibold text-[var(--color-warning)]")}>
            {formatWhen(reminder.scheduledAt)}
          </span>
          {reminder.task && (
            <>
              <span aria-hidden>·</span>
              <Link
                href={`/tasks/${reminder.task.id}`}
                className="text-accent hover:underline underline-offset-2 truncate"
              >
                {reminder.task.workflowStep.title}
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {!reminder.seen && (
          <button
            type="button"
            onClick={markSeen}
            disabled={busy !== null}
            className="text-xs px-2 py-1 rounded text-muted-foreground hover:bg-muted hover:text-[var(--color-text)] disabled:opacity-50 transition-colors"
          >
            {busy === "seen" ? "..." : "סמן כנקרא"}
          </button>
        )}
        <button
          type="button"
          onClick={remove}
          disabled={busy !== null}
          className="text-xs px-2 py-1 rounded text-muted-foreground hover:bg-muted hover:text-[oklch(50%_0.18_25)] disabled:opacity-50 transition-colors"
        >
          {busy === "delete" ? "..." : "מחק"}
        </button>
      </div>
    </li>
  )
}
