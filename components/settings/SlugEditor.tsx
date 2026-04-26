"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface Props {
  slug: string | null
  baseUrl: string
}

export function SlugEditor({ slug: initSlug, baseUrl }: Props) {
  const router = useRouter()
  const [slug, setSlug] = useState(initSlug ?? "")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [saved, setSaved] = useState(false)

  const publicUrl = slug ? `${baseUrl}/f/${slug}` : null

  async function save() {
    setError("")
    setSaved(false)
    if (!slug.trim()) { setError("נדרש סלאג"); return }
    setSaving(true)
    const res = await fetch("/api/user/lead-form", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
    })
    setSaving(false)
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data?.error ?? "שגיאה בשמירה")
      return
    }
    setSaved(true)
    router.refresh()
  }

  return (
    <div className="bg-surface-raised rounded-2xl border border-border p-5 flex flex-col gap-3 mb-6">
      <p className="font-semibold text-sm text-[var(--color-text)]">קישור הטופס הציבורי</p>
      <p className="text-xs text-[var(--color-muted-fg)]">
        זה הקישור שתשלח ללקוחות — הם ימלאו את הטופס וייכנסו למערכת כלידים.
      </p>

      <div className="flex gap-2 items-center">
        <span className="text-sm text-[var(--color-muted-fg)] shrink-0">{baseUrl}/f/</span>
        <input
          className="h-9 flex-1 rounded-md border border-border bg-surface-raised px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="clinic-name"
          value={slug}
          onChange={e => {
            setSaved(false)
            setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/--+/g, "-"))
          }}
        />
        <button
          onClick={save}
          disabled={saving}
          className="px-4 py-2 rounded-lg text-sm font-semibold text-white shrink-0 disabled:opacity-60"
          style={{ background: "var(--color-highlight)" }}
        >
          {saving ? "שומר..." : "שמור"}
        </button>
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}
      {saved && <p className="text-xs text-green-600">נשמר!</p>}

      {publicUrl && (
        <a
          href={publicUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium underline break-all"
          style={{ color: "var(--color-highlight)" }}
        >
          {publicUrl} ↗
        </a>
      )}
    </div>
  )
}
