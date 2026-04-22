"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { LeadFormConfig } from "@/lib/validations/lead-form"

interface Props {
  slug: string
  config: LeadFormConfig
}

export function PublicLeadForm({ slug, config }: Props) {
  const router = useRouter()
  const [form, setForm] = useState({
    name: "", phone: "", treatment: "", source: "", message: "", preferredDate: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const body: Record<string, string> = { name: form.name, phone: form.phone }
      if (config.fields.includes("treatment") && form.treatment) body.treatment = form.treatment
      if (config.fields.includes("source") && form.source) body.source = form.source
      if (config.fields.includes("message") && form.message) body.message = form.message
      if (config.fields.includes("preferredDate") && form.preferredDate) body.preferredDate = form.preferredDate

      const res = await fetch(`/api/public/lead-form/${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (res.status === 429) { setError("נסה שוב מאוחר יותר"); return }
      if (!res.ok) { setError("שגיאה בשליחה, נסה שוב"); return }

      router.push(`/f/${slug}/thanks`)
    } catch {
      setError("שגיאה בשליחה, נסה שוב")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4" dir="rtl">
      {/* Name */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="public-name" className="text-sm font-medium">שם מלא <span className="text-red-500">*</span></label>
        <input
          id="public-name"
          required
          className="h-11 rounded-xl border border-border bg-white/80 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-highlight)]"
          placeholder="ישראל ישראלי"
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
        />
      </div>

      {/* Phone */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="public-phone" className="text-sm font-medium">טלפון <span className="text-red-500">*</span></label>
        <input
          id="public-phone"
          required
          type="tel"
          dir="ltr"
          className="h-11 rounded-xl border border-border bg-white/80 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-highlight)]"
          placeholder="050-0000000"
          value={form.phone}
          onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
        />
      </div>

      {/* Optional fields */}
      {config.fields.includes("treatment") && (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="public-treatment" className="text-sm font-medium">טיפול מבוקש</label>
          <input
            id="public-treatment"
            className="h-11 rounded-xl border border-border bg-white/80 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-highlight)]"
            placeholder="בוטוקס, לייזר..."
            value={form.treatment}
            onChange={e => setForm(f => ({ ...f, treatment: e.target.value }))}
          />
        </div>
      )}

      {config.fields.includes("source") && (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="public-source" className="text-sm font-medium">מאיפה שמעת עלינו?</label>
          <input
            id="public-source"
            className="h-11 rounded-xl border border-border bg-white/80 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-highlight)]"
            placeholder="אינסטגרם, פייסבוק..."
            value={form.source}
            onChange={e => setForm(f => ({ ...f, source: e.target.value }))}
          />
        </div>
      )}

      {config.fields.includes("message") && (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="public-message" className="text-sm font-medium">הודעה</label>
          <textarea
            id="public-message"
            rows={3}
            className="rounded-xl border border-border bg-white/80 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-highlight)] resize-none"
            placeholder="כתוב הודעה קצרה..."
            value={form.message}
            onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
          />
        </div>
      )}

      {config.fields.includes("preferredDate") && (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="public-date" className="text-sm font-medium">תאריך מועדף</label>
          <input
            id="public-date"
            type="date"
            className="h-11 rounded-xl border border-border bg-white/80 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-highlight)]"
            value={form.preferredDate}
            onChange={e => setForm(f => ({ ...f, preferredDate: e.target.value }))}
          />
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="h-12 rounded-xl font-semibold text-white text-base disabled:opacity-60 transition-all active:scale-[0.98]"
        style={{ background: "var(--color-highlight)" }}
      >
        {loading ? "שולח..." : "שלח פרטים"}
      </button>
    </form>
  )
}
