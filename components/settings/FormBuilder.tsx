"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { FormField } from "@prisma/client"

interface Props {
  templateId: string | null
  fields: FormField[]
  title: string
  subtitle: string
  isActive: boolean
}

const inputClass = "h-9 w-full rounded-md border border-border bg-surface-raised px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
const labelClass = "text-sm font-medium text-[var(--color-text)]"

const FIELD_TYPES = [
  { value: "text", label: "טקסט חופשי" },
  { value: "textarea", label: "טקסט ארוך" },
  { value: "select", label: "רשימת בחירה" },
  { value: "radio", label: "בחירה אחת" },
  { value: "date", label: "תאריך" },
  { value: "number", label: "מספר" },
]

export function FormBuilder({ templateId, fields, title: initTitle, subtitle: initSubtitle, isActive: initActive }: Props) {
  const router = useRouter()
  const [title, setTitle] = useState(initTitle)
  const [subtitle, setSubtitle] = useState(initSubtitle)
  const [isActive, setIsActive] = useState(initActive)
  const [saving, setSaving] = useState(false)

  const [showAdd, setShowAdd] = useState(false)
  const [newField, setNewField] = useState({ type: "text", key: "", label: "", placeholder: "", isRequired: false, optionsRaw: "" })
  const [addLoading, setAddLoading] = useState(false)
  const [addError, setAddError] = useState("")

  async function saveTemplate() {
    setSaving(true)
    await fetch("/api/form-template", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, subtitle, isActive }),
    })
    setSaving(false)
    router.refresh()
  }

  async function addField() {
    setAddError("")
    if (!newField.key || !newField.label) { setAddError("מפתח ותווית חובה"); return }
    setAddLoading(true)

    let options: { label: string; value: string }[] | undefined
    if (["select", "radio"].includes(newField.type) && newField.optionsRaw) {
      options = newField.optionsRaw.split("\n").map(line => {
        const [value, ...rest] = line.split(":")
        return { value: value.trim(), label: rest.join(":").trim() || value.trim() }
      }).filter(o => o.value)
    }

    const res = await fetch("/api/form-template/fields", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: newField.type,
        key: newField.key,
        label: newField.label,
        placeholder: newField.placeholder || undefined,
        isRequired: newField.isRequired,
        displayOrder: fields.length,
        options,
      }),
    })
    setAddLoading(false)
    if (!res.ok) {
      const data = await res.json()
      setAddError(data?.error ?? "שגיאה בהוספה")
      return
    }
    setShowAdd(false)
    setNewField({ type: "text", key: "", label: "", placeholder: "", isRequired: false, optionsRaw: "" })
    router.refresh()
  }

  async function deleteField(id: string) {
    await fetch(`/api/form-template/fields/${id}`, { method: "DELETE" })
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-6 max-w-xl" dir="rtl">
      {/* Template meta */}
      <div className="bg-surface-raised rounded-2xl border border-border p-5 flex flex-col gap-3">
        <p className="font-semibold text-sm text-[var(--color-text)]">הגדרות טופס</p>
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>כותרת</label>
          <input className={inputClass} value={title} onChange={e => setTitle(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>תת-כותרת</label>
          <input className={inputClass} value={subtitle} onChange={e => setSubtitle(e.target.value)} />
        </div>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="accent-[var(--color-highlight)]" />
          הטופס פעיל
        </label>
        <button onClick={saveTemplate} disabled={saving} className="px-4 py-2 rounded-lg text-sm font-semibold text-white self-start disabled:opacity-60" style={{ background: "var(--color-highlight)" }}>
          {saving ? "שומר..." : "שמור הגדרות"}
        </button>
      </div>

      {/* Fields list */}
      <div>
        <p className="font-semibold text-sm text-[var(--color-text)] mb-3">שדות הטופס</p>
        <div className="bg-surface-raised rounded-xl border border-border divide-y divide-border mb-3">
          <div className="px-4 py-2.5 bg-[var(--color-surface)] rounded-t-xl">
            <p className="text-xs text-[var(--color-muted-fg)]">שם מלא · טלפון (ברירת מחדל, לא ניתן להסיר)</p>
          </div>
          {fields.filter(f => !f.isCore).map(f => (
            <div key={f.id} className="flex items-center justify-between px-4 py-2.5 gap-4">
              <div>
                <p className="text-sm font-medium text-[var(--color-text)]">{f.label}</p>
                <p className="text-xs text-[var(--color-muted-fg)]">{f.type} · {f.key}{f.isRequired ? " · חובה" : ""}</p>
              </div>
              <button onClick={() => deleteField(f.id)} className="text-xs text-red-400 hover:text-red-600 transition-colors">הסר</button>
            </div>
          ))}
          {fields.filter(f => !f.isCore).length === 0 && (
            <div className="px-4 py-4 text-center text-xs text-[var(--color-muted-fg)]">אין שדות נוספים עדיין</div>
          )}
        </div>

        {!showAdd ? (
          <button onClick={() => setShowAdd(true)} className="text-sm font-medium" style={{ color: "var(--color-highlight)" }}>+ הוסף שדה</button>
        ) : (
          <div className="bg-surface-raised rounded-xl border border-border p-4 flex flex-col gap-3">
            <p className="font-semibold text-sm">שדה חדש</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-[var(--color-muted-fg)]">סוג</label>
                <select className={inputClass} value={newField.type} onChange={e => setNewField(f => ({ ...f, type: e.target.value }))}>
                  {FIELD_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-[var(--color-muted-fg)]">מפתח (key)</label>
                <input className={inputClass} placeholder="first_visit" value={newField.key}
                  onChange={e => setNewField(f => ({ ...f, key: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "_") }))} />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-[var(--color-muted-fg)]">תווית</label>
              <input className={inputClass} placeholder="האם זה הטיפול הראשון שלך?" value={newField.label} onChange={e => setNewField(f => ({ ...f, label: e.target.value }))} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-[var(--color-muted-fg)]">placeholder (אופציונלי)</label>
              <input className={inputClass} value={newField.placeholder} onChange={e => setNewField(f => ({ ...f, placeholder: e.target.value }))} />
            </div>
            {["select", "radio"].includes(newField.type) && (
              <div className="flex flex-col gap-1">
                <label className="text-xs text-[var(--color-muted-fg)]">אפשרויות (שורה לכל אפשרות, בפורמט: value:תווית)</label>
                <textarea rows={3} className="rounded-md border border-border bg-surface-raised px-3 py-2 text-sm resize-none" placeholder={"yes:כן\nno:לא"} value={newField.optionsRaw} onChange={e => setNewField(f => ({ ...f, optionsRaw: e.target.value }))} />
              </div>
            )}
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={newField.isRequired} onChange={e => setNewField(f => ({ ...f, isRequired: e.target.checked }))} className="accent-[var(--color-highlight)]" />
              שדה חובה
            </label>
            {addError && <p className="text-xs text-red-500">{addError}</p>}
            <div className="flex gap-2">
              <button onClick={addField} disabled={addLoading} className="px-4 py-1.5 rounded-lg text-sm font-semibold text-white disabled:opacity-60" style={{ background: "var(--color-highlight)" }}>
                {addLoading ? "מוסיף..." : "הוסף שדה"}
              </button>
              <button onClick={() => { setShowAdd(false); setAddError("") }} className="px-3 py-1.5 rounded-lg text-sm border border-border hover:bg-surface transition-colors">ביטול</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
