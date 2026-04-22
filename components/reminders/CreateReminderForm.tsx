"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { useTranslations } from "next-intl"

interface Props {
  /** If provided, the reminder is linked to this task. */
  taskId?: string
  /** Optional placeholder suggestion when used inside a task context. */
  suggestion?: string
  onCreated?: () => void
}

function defaultScheduledAt(): string {
  // Default to tomorrow 9:00 AM local, formatted for datetime-local input
  const d = new Date()
  d.setDate(d.getDate() + 1)
  d.setHours(9, 0, 0, 0)
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function CreateReminderForm({ taskId, suggestion, onCreated }: Props) {
  const t = useTranslations("reminders")
  const router = useRouter()
  const [message, setMessage] = useState(suggestion ?? "")
  const [scheduledAt, setScheduledAt] = useState(defaultScheduledAt())
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    const res = await fetch("/api/reminders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        scheduledAt: new Date(scheduledAt).toISOString(),
        taskId: taskId ?? null,
      }),
    })

    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string }
      setError(body.error ?? t("errorCreate"))
      setSubmitting(false)
      return
    }

    // Reset form and refresh server data
    setMessage(suggestion ?? "")
    setScheduledAt(defaultScheduledAt())
    setSubmitting(false)
    onCreated?.()
    router.refresh()
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <Input
        label={t("remindMe")}
        placeholder={t("remindMePlaceholder")}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        maxLength={200}
        required
      />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="scheduledAt" className="text-sm font-medium text-[var(--color-text)]">
          {t("when")}
        </label>
        <input
          id="scheduledAt"
          type="datetime-local"
          value={scheduledAt}
          onChange={(e) => setScheduledAt(e.target.value)}
          required
          className="h-10 rounded-md border border-border bg-surface-raised px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
        />
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-md bg-[var(--color-warning-surface)] text-[var(--color-warning)] px-3 py-2 text-sm"
        >
          {error}
        </div>
      )}

      <Button type="submit" loading={submitting} className="self-start">
        {t("add")}
      </Button>
    </form>
  )
}
