"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DOC_TYPES, findDocType, type DocTypeDef } from "@/lib/documents/docTypes"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"

interface Props {
  documentId: string
  initialDocType: string | null
  initialFields: Record<string, string | number | null> | null
}

/**
 * Lets the user classify an uploaded document and fill known fields.
 * No OCR yet — user types values. Saved to Document.extractedFields for reuse.
 */
export function ExtractFieldsForm({ documentId, initialDocType, initialFields }: Props) {
  const router = useRouter()
  const [docTypeId, setDocTypeId] = useState<string>(initialDocType ?? "other")
  const [values, setValues] = useState<Record<string, string>>(() => {
    const out: Record<string, string> = {}
    if (initialFields) {
      for (const [k, v] of Object.entries(initialFields)) {
        out[k] = v == null ? "" : String(v)
      }
    }
    return out
  })
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const docType: DocTypeDef = findDocType(docTypeId) ?? DOC_TYPES[DOC_TYPES.length - 1]

  const save = async () => {
    setSaving(true)
    setError(null)

    // Coerce numeric fields back to numbers; empty strings → null
    const extractedFields: Record<string, string | number | null> = {}
    for (const field of docType.fields) {
      const raw = values[field.key] ?? ""
      if (raw.trim() === "") {
        extractedFields[field.key] = null
      } else if (field.inputType === "number") {
        const n = Number(raw)
        extractedFields[field.key] = Number.isNaN(n) ? null : n
      } else {
        extractedFields[field.key] = raw.trim()
      }
    }

    const res = await fetch(`/api/documents/${documentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        docType: docTypeId,
        extractedFields,
      }),
    })

    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string }
      setError(body.error ?? "שגיאה בשמירה")
      setSaving(false)
      return
    }

    setSavedAt(Date.now())
    setSaving(false)
    router.refresh()
  }

  const recentlySaved = savedAt !== null && Date.now() - savedAt < 2000

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-[var(--color-text)]">
          סוג המסמך
        </label>
        <select
          value={docTypeId}
          onChange={(e) => setDocTypeId(e.target.value)}
          className="h-10 rounded-md border border-border bg-surface-raised px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
        >
          {DOC_TYPES.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
        {docType.description && (
          <p className="text-xs text-muted-foreground">{docType.description}</p>
        )}
      </div>

      {docType.fields.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {docType.fields.map((field) => (
            <Input
              key={field.key}
              label={field.label}
              type={field.inputType ?? "text"}
              placeholder={field.placeholder}
              value={values[field.key] ?? ""}
              onChange={(e) =>
                setValues((v) => ({ ...v, [field.key]: e.target.value }))
              }
            />
          ))}
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="rounded-md bg-[var(--color-warning-surface)] text-[var(--color-warning)] px-3 py-2 text-sm"
        >
          {error}
        </div>
      )}

      <div className="flex items-center gap-3">
        <Button type="button" onClick={save} loading={saving}>
          שמור פרטים
        </Button>
        {recentlySaved && (
          <span className="text-sm text-[var(--color-highlight)] animate-fade-in">
            ✓ נשמר
          </span>
        )}
      </div>
    </div>
  )
}
