"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export function ServiceToggle({ id, isActive }: { id: string; isActive: boolean }) {
  const [active, setActive] = useState(isActive)
  const router = useRouter()

  async function toggle() {
    const next = !active
    setActive(next)
    await fetch(`/api/services/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: next }),
    })
    router.refresh()
  }

  return (
    <button
      onClick={toggle}
      className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors"
      style={{ background: active ? "var(--color-highlight)" : "var(--color-border)" }}
      title={active ? "השבת" : "הפעל"}
    >
      <span
        className="inline-block h-4 w-4 rounded-full bg-white shadow transition-transform"
        style={{ transform: active ? "translateX(18px)" : "translateX(2px)" }}
      />
    </button>
  )
}
