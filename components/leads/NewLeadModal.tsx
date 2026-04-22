"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"

interface Props {
  locale: string
}

export function NewLeadModal({ locale }: Props) {
  const t = useTranslations("leads")
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    name: "", phone: "", source: "", treatmentWanted: "", notes: "",
  })

  const dir = locale === "he" ? "rtl" : "ltr"

  function reset() {
    setForm({ name: "", phone: "", source: "", treatmentWanted: "", notes: "" })
    setError("")
  }

  function close() {
    reset()
    setOpen(false)
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const clientRes = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          source: form.source || undefined,
          treatmentWanted: form.treatmentWanted || undefined,
          notes: form.notes || undefined,
        }),
      })
      if (!clientRes.ok) throw new Error()
      const client = await clientRes.json()

      const leadRes = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: client.id }),
      })
      if (!leadRes.ok) throw new Error()

      close()
      router.refresh()
    } catch {
      setError(t("addError"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
        style={{ background: "var(--color-highlight)" }}
      >
        {t("newLead")}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" dir={dir}>
          <div className="absolute inset-0 bg-black/50" onClick={close} />
          <div className="relative w-full max-w-md bg-surface-raised rounded-2xl border border-border shadow-card p-6">
            <h2 className="font-display text-xl font-bold text-[var(--color-text)] mb-5">
              {t("newLead")}
            </h2>

            <form onSubmit={submit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[var(--color-text)]">
                  {t("fullName")} <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  className="h-10 w-full rounded-md border border-border bg-surface-raised px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder={t("namePlaceholder")}
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[var(--color-text)]">
                  {t("phone")} <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="tel"
                  dir="ltr"
                  className="h-10 w-full rounded-md border border-border bg-surface-raised px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder={t("phonePlaceholder")}
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-[var(--color-text)]">{t("source")}</label>
                  <input
                    className="h-10 w-full rounded-md border border-border bg-surface-raised px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder={t("sourcePlaceholder")}
                    value={form.source}
                    onChange={e => setForm(f => ({ ...f, source: e.target.value }))}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-[var(--color-text)]">{t("treatmentWanted")}</label>
                  <input
                    className="h-10 w-full rounded-md border border-border bg-surface-raised px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder={t("treatmentPlaceholder")}
                    value={form.treatmentWanted}
                    onChange={e => setForm(f => ({ ...f, treatmentWanted: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[var(--color-text)]">{t("notes")}</label>
                <textarea
                  rows={3}
                  className="w-full rounded-md border border-border bg-surface-raised px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                />
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <div className="flex gap-3 justify-end mt-1">
                <button
                  type="button"
                  onClick={close}
                  className="px-4 py-2 rounded-lg text-sm font-medium border border-border hover:bg-surface transition-colors"
                >
                  {t("cancel")}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-60"
                  style={{ background: "var(--color-highlight)" }}
                >
                  {loading ? t("adding") : t("addLead")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
