"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import type { FormField } from "@prisma/client"
import { DynamicField } from "./DynamicField"
import { evaluateConditions, type FieldCondition } from "@/lib/form/evaluate-conditions"
import type { LeadFormConfig } from "@/lib/validations/lead-form"

interface Service {
  id: string
  name: string
  priceType: string
  priceValue: number | null
  durationMin: number | null
  description: string | null
}

interface DynamicFormProps {
  slug: string
  fields: FormField[]
  services: Service[]
  title?: string
}

interface LegacyFormProps {
  slug: string
  config: LeadFormConfig
}

type Props = DynamicFormProps | LegacyFormProps

function isDynamic(props: Props): props is DynamicFormProps {
  return "fields" in props
}

function formatPrice(priceType: string, priceValue: number | null): string | null {
  if (priceType === "hidden" || priceValue === null) return null
  const formatted = `₪${(priceValue / 100).toLocaleString("he-IL")}`
  return priceType === "from" ? `מ-${formatted}` : formatted
}

export function PublicLeadForm(props: Props) {
  const router = useRouter()
  const [formState, setFormState] = useState<Record<string, unknown>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  function setField(key: string, value: unknown) {
    setFormState(prev => ({ ...prev, [key]: value }))
  }

  // Legacy form (old leadFormConfig)
  if (!isDynamic(props)) {
    const { slug, config } = props
    return (
      <form onSubmit={async e => {
        e.preventDefault()
        setError("")
        setLoading(true)
        try {
          const body: Record<string, unknown> = {
            name: formState.name ?? "",
            phone: formState.phone ?? "",
            answers: {},
          }
          if (config.fields.includes("treatment") && formState.treatment) body.treatment = formState.treatment
          if (config.fields.includes("source") && formState.source) body.source = formState.source
          if (config.fields.includes("message") && formState.message) body.message = formState.message
          if (config.fields.includes("preferredDate") && formState.preferredDate) body.preferredDate = formState.preferredDate
          const res = await fetch(`/api/public/lead-form/${slug}`, {
            method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
          })
          if (res.status === 429) { setError("נסה שוב מאוחר יותר"); return }
          if (!res.ok) { setError("שגיאה בשליחה, נסה שוב"); return }
          router.push(`/f/${slug}/thanks`)
        } catch { setError("שגיאה בשליחה, נסה שוב") } finally { setLoading(false) }
      }} className="flex flex-col gap-4" dir="rtl">
        <LegacyFields config={config} formState={formState} setField={setField} />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <SubmitButton loading={loading} />
      </form>
    )
  }

  // Dynamic form
  const { slug, fields, services } = props

  const visibleFields = useMemo(() => {
    return fields.filter(f =>
      f.isCore || evaluateConditions(f.conditions as FieldCondition[] | null, formState)
    )
  }, [fields, formState])

  const hasServiceSelector = services.length > 0

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const answers: Record<string, unknown> = {}
      for (const f of visibleFields) {
        if (!f.isCore && f.key !== "name" && f.key !== "phone") {
          answers[f.key] = formState[f.key]
        }
      }
      const selectedService = services.find(s => s.id === formState.service_id)
      const body = {
        name: formState.name ?? "",
        phone: formState.phone ?? "",
        serviceId: formState.service_id ?? undefined,
        treatment: selectedService?.name ?? undefined,
        message: (answers.message as string | undefined) || undefined,
        answers,
      }
      const res = await fetch(`/api/public/lead-form/${slug}`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
      })
      if (res.status === 429) { setError("נסה שוב מאוחר יותר"); return }
      if (!res.ok) { setError("שגיאה בשליחה, נסה שוב"); return }
      router.push(`/f/${slug}/thanks`)
    } catch { setError("שגיאה בשליחה, נסה שוב") } finally { setLoading(false) }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4" dir="rtl">
      {/* Core: name */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">שם מלא <span className="text-red-500">*</span></label>
        <input
          required
          className="h-11 rounded-xl border border-border bg-white/80 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-highlight)]"
          placeholder="ישראל ישראלי"
          value={String(formState.name ?? "")}
          onChange={e => setField("name", e.target.value)}
        />
      </div>

      {/* Core: phone */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">טלפון <span className="text-red-500">*</span></label>
        <input
          required
          type="tel"
          dir="ltr"
          className="h-11 rounded-xl border border-border bg-white/80 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-highlight)]"
          placeholder="050-0000000"
          value={String(formState.phone ?? "")}
          onChange={e => setField("phone", e.target.value)}
        />
      </div>

      {/* Service selector */}
      {hasServiceSelector && (
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">טיפול מבוקש</label>
          <div className="flex flex-col gap-2">
            {services.map(s => {
              const price = formatPrice(s.priceType, s.priceValue)
              const selected = formState.service_id === s.id
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setField("service_id", selected ? "" : s.id)}
                  className="flex items-center justify-between px-4 py-3 rounded-xl border text-sm text-right transition-colors"
                  style={{
                    borderColor: selected ? "var(--color-highlight)" : "var(--color-border)",
                    background: selected ? "oklch(97% 0.02 10)" : "white",
                  }}
                >
                  <div>
                    <span className="font-medium">{s.name}</span>
                    {s.description && <p className="text-xs text-[var(--color-muted-fg)] mt-0.5">{s.description}</p>}
                  </div>
                  <div className="flex flex-col items-end gap-0.5 shrink-0 mr-2">
                    {price && <span className="text-xs font-semibold" style={{ color: "var(--color-highlight)" }}>{price}</span>}
                    {s.durationMin && <span className="text-xs text-[var(--color-muted-fg)]">{s.durationMin} דק׳</span>}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Dynamic fields */}
      {visibleFields
        .filter(f => !f.isCore)
        .map(f => (
          <DynamicField
            key={f.id}
            field={f}
            value={formState[f.key]}
            onChange={setField}
          />
        ))}

      {error && <p className="text-sm text-red-600">{error}</p>}
      <SubmitButton loading={loading} />
    </form>
  )
}

function SubmitButton({ loading }: { loading: boolean }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="h-12 rounded-xl font-semibold text-white text-base disabled:opacity-60 transition-all active:scale-[0.98]"
      style={{ background: "var(--color-highlight)" }}
    >
      {loading ? "שולח..." : "שלח פרטים"}
    </button>
  )
}

function LegacyFields({
  config, formState, setField,
}: { config: LeadFormConfig; formState: Record<string, unknown>; setField: (k: string, v: unknown) => void }) {
  const inputClass = "h-11 rounded-xl border border-border bg-white/80 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-highlight)]"
  return (
    <>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">שם מלא <span className="text-red-500">*</span></label>
        <input required className={inputClass} placeholder="ישראל ישראלי" value={String(formState.name ?? "")} onChange={e => setField("name", e.target.value)} />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">טלפון <span className="text-red-500">*</span></label>
        <input required type="tel" dir="ltr" className={inputClass} placeholder="050-0000000" value={String(formState.phone ?? "")} onChange={e => setField("phone", e.target.value)} />
      </div>
      {config.fields.includes("treatment") && (
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">טיפול מבוקש</label>
          <input className={inputClass} placeholder="בוטוקס, לייזר..." value={String(formState.treatment ?? "")} onChange={e => setField("treatment", e.target.value)} />
        </div>
      )}
      {config.fields.includes("message") && (
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">הודעה</label>
          <textarea rows={3} className="rounded-xl border border-border bg-white/80 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-highlight)] resize-none" value={String(formState.message ?? "")} onChange={e => setField("message", e.target.value)} />
        </div>
      )}
    </>
  )
}
