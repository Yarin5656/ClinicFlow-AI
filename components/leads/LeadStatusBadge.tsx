"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"

const STATUSES = ["NEW", "FOLLOW_UP", "QUOTED", "BOOKED", "WON", "LOST"] as const
type LeadStatus = typeof STATUSES[number]

const STATUS_LABELS: Record<LeadStatus, string> = {
  NEW: "חדש",
  FOLLOW_UP: "מעקב",
  QUOTED: "הצעת מחיר",
  BOOKED: "נקבע תור",
  WON: "נסגר ✓",
  LOST: "לא מתקדם",
}

const STATUS_CLASSES: Record<LeadStatus, string> = {
  NEW: "bg-blue-100 text-blue-700",
  FOLLOW_UP: "bg-amber-100 text-amber-800",
  QUOTED: "bg-purple-100 text-purple-800",
  BOOKED: "bg-green-100 text-green-800",
  WON: "bg-emerald-100 text-emerald-800",
  LOST: "bg-red-100 text-red-800",
}

interface Props {
  leadId: string
  status: LeadStatus
}

export function LeadStatusBadge({ leadId, status: initialStatus }: Props) {
  const [status, setStatus] = useState(initialStatus)
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  async function select(newStatus: LeadStatus) {
    if (newStatus === status) { setOpen(false); return }
    setSaving(true)
    setOpen(false)
    try {
      await fetch(`/api/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      setStatus(newStatus)
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={() => setOpen(o => !o)}
        disabled={saving}
        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold cursor-pointer transition-opacity ${STATUS_CLASSES[status]} ${saving ? "opacity-50" : "hover:opacity-80"}`}
      >
        {STATUS_LABELS[status]}
        <svg className="w-3 h-3" viewBox="0 0 12 12" fill="currentColor">
          <path d="M6 8L2 4h8L6 8z" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-36 rounded-xl border border-border bg-surface-raised shadow-card overflow-hidden" style={{ top: "100%", right: 0 }}>
          {STATUSES.map(s => (
            <button
              key={s}
              onClick={() => select(s)}
              className={`w-full text-right px-3 py-2 text-xs font-medium transition-colors hover:bg-[var(--color-surface)] ${s === status ? "opacity-50 cursor-default" : ""}`}
            >
              <span className={`inline-block px-2 py-0.5 rounded-full ${STATUS_CLASSES[s]}`}>
                {STATUS_LABELS[s]}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
