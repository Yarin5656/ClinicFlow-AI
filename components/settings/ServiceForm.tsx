"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface Staff { id: string; name: string }
interface Location { id: string; name: string }
interface Category { id: string; name: string }

interface Service {
  id?: string
  name: string
  description: string
  categoryId: string
  priceType: "exact" | "from" | "hidden"
  priceValue: string
  durationMin: string
  isActive: boolean
  isBookable: boolean
  staffId: string
  locationId: string
  displayOrder: string
}

interface Props {
  initial?: Partial<Service>
  staff: Staff[]
  locations: Location[]
  categories: Category[]
  locale: string
}

const inputClass = "h-10 w-full rounded-md border border-border bg-surface-raised px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
const labelClass = "text-sm font-medium text-[var(--color-text)]"

export function ServiceForm({ initial, staff, locations, categories, locale }: Props) {
  const router = useRouter()
  const [form, setForm] = useState<Service>({
    name: initial?.name ?? "",
    description: initial?.description ?? "",
    categoryId: initial?.categoryId ?? "",
    priceType: initial?.priceType ?? "hidden",
    priceValue: initial?.priceValue ?? "",
    durationMin: initial?.durationMin ?? "",
    isActive: initial?.isActive ?? true,
    isBookable: initial?.isBookable ?? false,
    staffId: initial?.staffId ?? "",
    locationId: initial?.locationId ?? "",
    displayOrder: initial?.displayOrder ?? "0",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const isEdit = Boolean(initial?.id)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const payload = {
        name: form.name,
        description: form.description || undefined,
        categoryId: form.categoryId || undefined,
        priceType: form.priceType,
        priceValue: form.priceValue ? Math.round(parseFloat(form.priceValue) * 100) : undefined,
        durationMin: form.durationMin ? parseInt(form.durationMin) : undefined,
        isActive: form.isActive,
        isBookable: form.isBookable,
        staffId: form.staffId || undefined,
        locationId: form.locationId || undefined,
        displayOrder: parseInt(form.displayOrder) || 0,
      }
      const url = isEdit ? `/api/services/${initial!.id}` : "/api/services"
      const method = isEdit ? "PUT" : "POST"
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      if (!res.ok) { setError("שגיאה בשמירה"); return }
      router.push(`/${locale}/settings/services`)
      router.refresh()
    } catch { setError("שגיאה בשמירה") } finally { setLoading(false) }
  }

  const set = (k: keyof Service, v: unknown) => setForm(f => ({ ...f, [k]: v }))

  return (
    <form onSubmit={submit} className="flex flex-col gap-4 max-w-lg" dir="rtl">
      <div className="flex flex-col gap-1.5">
        <label className={labelClass}>שם השירות <span className="text-red-500">*</span></label>
        <input required className={inputClass} value={form.name} onChange={e => set("name", e.target.value)} placeholder="בוטוקס פנים" />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelClass}>תיאור קצר</label>
        <input className={inputClass} value={form.description} onChange={e => set("description", e.target.value)} placeholder="תיאור קצר של הטיפול" />
      </div>

      {categories.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>קטגוריה</label>
          <select className={inputClass} value={form.categoryId} onChange={e => set("categoryId", e.target.value)}>
            <option value="">ללא קטגוריה</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>תמחור</label>
          <select className={inputClass} value={form.priceType} onChange={e => set("priceType", e.target.value as Service["priceType"])}>
            <option value="hidden">מוסתר</option>
            <option value="exact">מחיר מדויק</option>
            <option value="from">החל מ-</option>
          </select>
        </div>
        {form.priceType !== "hidden" && (
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>מחיר (₪)</label>
            <input type="number" min="0" step="0.01" className={inputClass} value={form.priceValue} onChange={e => set("priceValue", e.target.value)} placeholder="0" />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelClass}>משך טיפול (דקות)</label>
        <input type="number" min="1" className={inputClass} value={form.durationMin} onChange={e => set("durationMin", e.target.value)} placeholder="30" />
      </div>

      {staff.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>איש צוות</label>
          <select className={inputClass} value={form.staffId} onChange={e => set("staffId", e.target.value)}>
            <option value="">כל הצוות</option>
            {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
      )}

      {locations.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>סניף</label>
          <select className={inputClass} value={form.locationId} onChange={e => set("locationId", e.target.value)}>
            <option value="">כל הסניפים</option>
            {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
        </div>
      )}

      <div className="flex gap-4">
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={form.isActive} onChange={e => set("isActive", e.target.checked)} className="accent-[var(--color-highlight)]" />
          פעיל
        </label>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex gap-3">
        <button type="submit" disabled={loading} className="px-5 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-60" style={{ background: "var(--color-highlight)" }}>
          {loading ? "שומר..." : isEdit ? "עדכן שירות" : "הוסף שירות"}
        </button>
        <button type="button" onClick={() => router.back()} className="px-4 py-2 rounded-lg text-sm border border-border hover:bg-surface transition-colors">
          ביטול
        </button>
      </div>
    </form>
  )
}
