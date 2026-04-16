"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

/**
 * Polls /api/reminders every 60s and shows an unread badge.
 * Refetches on path change so marking-as-seen on /reminders updates the bell.
 */
export function ReminderBell() {
  const pathname = usePathname()
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false

    const fetchCount = async () => {
      try {
        const res = await fetch("/api/reminders", { cache: "no-store" })
        if (!res.ok) return
        const data = (await res.json()) as { dueUnseenCount: number }
        if (!cancelled) setCount(data.dueUnseenCount)
      } catch {
        // silent — bell just won't update
      }
    }

    fetchCount()
    const interval = setInterval(fetchCount, 60_000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [pathname])

  const hasUnseen = (count ?? 0) > 0

  return (
    <Link
      href="/reminders"
      className={cn(
        "relative inline-flex items-center justify-center h-9 w-9 rounded-full",
        "text-muted-foreground hover:bg-muted hover:text-[var(--color-text)]",
        "transition-colors duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      )}
      aria-label={hasUnseen ? `${count} תזכורות חדשות` : "תזכורות"}
    >
      <span className="text-lg" aria-hidden>
        🔔
      </span>
      {hasUnseen && (
        <span
          className="absolute -top-0.5 -left-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[oklch(55%_0.17_25)] text-white text-[10px] font-bold flex items-center justify-center tabular-nums animate-fade-in"
          aria-hidden
        >
          {count! > 9 ? "9+" : count}
        </span>
      )}
    </Link>
  )
}
