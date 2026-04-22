// components/settings/LeadFormSettings.tsx
"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import type { LeadFormConfig, OptionalField } from "@/lib/validations/lead-form"
import { OPTIONAL_FIELDS } from "@/lib/validations/lead-form"

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://clinicflow-ai-xi.vercel.app"

interface Props {
  initialSlug: string | null
  initialConfig: LeadFormConfig | null
}

export function LeadFormSettings({ initialSlug, initialConfig }: Props) {
  const t = useTranslations("leadForm")

  const [slug, setSlug] = useState(initialSlug ?? "")
  const [title, setTitle] = useState(initialConfig?.title ?? "")
  const [subtitle, setSubtitle] = useState(initialConfig?.subtitle ?? "")
  const [active, setActive] = useState(initialConfig?.active ?? false)
  const [fields, setFields] = useState<OptionalField[]>(initialConfig?.fields ?? [])
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState("")
  const [copied, setCopied] = useState(false)

  const publicUrl = `${BASE_URL}/f/${slug}`

  function toggleField(f: OptionalField) {
    setFields(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f])
  }

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setStatus("saving")
    setErrorMsg("")
    try {
      const res = await fetch("/api/user/lead-form", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, config: { title, subtitle, active, fields } }),
      })
      const data = await res.json()
      if (!res.ok) {
        setErrorMsg(data.error ?? t("errorSave"))
        setStatus("error")
        return
      }
      setStatus("saved")
      setTimeout(() => setStatus("idle"), 2500)
    } catch {
      setErrorMsg(t("errorSave"))
      setStatus("error")
    }
  }

  function copyLink() {
    navigator.clipboard.writeText(publicUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }).catch(() => {})
  }

  const fieldLabels: Record<OptionalField, string> = {
    treatment: t("fieldTreatment"),
    source: t("fieldSource"),
    message: t("fieldMessage"),
    preferredDate: t("fieldPreferredDate"),
  }

  return (
    <form onSubmit={save} className="flex flex-col gap-5">
      {/* Active toggle */}
      <label className="flex items-center gap-3 cursor-pointer" htmlFor="lead-form-active">
        <div
          className={`relative w-11 h-6 rounded-full transition-colors ${active ? "bg-[var(--color-highlight)]" : "bg-border"}`}
          aria-hidden="true"
        >
          <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${active ? "right-0.5" : "left-0.5"}`} />
        </div>
        <input
          id="lead-form-active"
          type="checkbox"
          className="sr-only"
          checked={active}
          onChange={e => setActive(e.target.checked)}
        />
        <span className="text-sm font-medium text-[var(--color-text)]">{t("activeLabel")}</span>
      </label>

      {/* Slug */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="lead-form-slug" className="text-sm font-medium text-[var(--color-text)]">{t("slugLabel")}</label>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground shrink-0">{t("slugHint")}</span>
          <input
            id="lead-form-slug"
            required
            className="h-9 flex-1 rounded-md border border-border bg-surface px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder={t("slugPlaceholder")}
            value={slug}
            onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
          />
        </div>
        {slug && (
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-muted-foreground truncate">{publicUrl}</span>
            <button
              type="button"
              onClick={copyLink}
              className="shrink-0 text-xs px-2 py-1 rounded border border-border hover:bg-surface transition-colors"
            >
              {copied ? t("copied") : t("copyLink")}
            </button>
          </div>
        )}
      </div>

      {/* Title */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="lead-form-title" className="text-sm font-medium text-[var(--color-text)]">{t("titleLabel")}</label>
        <input
          id="lead-form-title"
          required
          className="h-9 w-full rounded-md border border-border bg-surface px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder={t("titlePlaceholder")}
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
      </div>

      {/* Subtitle */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="lead-form-subtitle" className="text-sm font-medium text-[var(--color-text)]">{t("subtitleLabel")}</label>
        <input
          id="lead-form-subtitle"
          className="h-9 w-full rounded-md border border-border bg-surface px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder={t("subtitlePlaceholder")}
          value={subtitle}
          onChange={e => setSubtitle(e.target.value)}
        />
      </div>

      {/* Optional fields */}
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-[var(--color-text)]">{t("fieldsLabel")}</span>
        <div className="grid grid-cols-2 gap-2">
          {OPTIONAL_FIELDS.map(f => (
            <label key={f} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={fields.includes(f)}
                onChange={() => toggleField(f)}
                className="rounded border-border accent-[var(--color-highlight)]"
              />
              <span className="text-sm text-[var(--color-text)]">{fieldLabels[f]}</span>
            </label>
          ))}
        </div>
      </div>

      {errorMsg && <p className="text-sm text-red-500">{errorMsg}</p>}

      <button
        type="submit"
        disabled={status === "saving"}
        className="self-start px-5 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-60 transition-all"
        style={{ background: "var(--color-highlight)" }}
      >
        {status === "saving" ? t("saving") : status === "saved" ? t("saved") : t("save")}
      </button>
    </form>
  )
}
