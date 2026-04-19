"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

/**
 * Polls /api/reminders every 60s and shows an unread badge.
 * Sits on top of the PageHero (dark navy), so it styles itself
 * as a glass pill that reads well against both navy and light surfaces.
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
        /* silent */
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
        "relative inline-flex items-center gap-2 h-10 pr-3 pl-2.5 rounded-full",
        "bg-white/15 text-white border border-white/20",
        "backdrop-blur-md shadow-sm",
        "hover:bg-white/25 transition-colors duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-highlight)]",
        "text-sm font-medium"
      )}
      aria-label={hasUnseen ? `${count} תזכורות חדשות` : "תזכורות"}
    >
      <span className="relative inline-flex items-center justify-center w-6 h-6 shrink-0" aria-hidden>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5"
        >
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
        {hasUnseen && (
          <span
            className="absolute -top-0.5 -right-1 min-w-[16px] h-[16px] px-1 rounded-full bg-[oklch(60%_0.2_25)] text-white text-[10px] font-bold flex items-center justify-center tabular-nums ring-2 ring-[oklch(22%_0.07_245)]"
          >
            {count! > 9 ? "9+" : count}
          </span>
        )}
      </span>
      <span className="hidden sm:inline">תזכורות</span>
    </Link>
  )
}
