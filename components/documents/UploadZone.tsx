"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/Button"

interface Props {
  taskId?: string
  onUploaded?: () => void
}

const ACCEPT = ".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"

export function UploadZone({ taskId, onUploaded }: Props) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)

  const handleFile = async (file: File) => {
    setError(null)
    setUploading(true)

    const form = new FormData()
    form.append("file", file)
    if (taskId) form.append("taskId", taskId)

    const res = await fetch("/api/documents", { method: "POST", body: form })

    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string }
      setError(body.error ?? "שגיאה בהעלאה")
      setUploading(false)
      return
    }

    setUploading(false)
    if (inputRef.current) inputRef.current.value = ""
    onUploaded?.()
    router.refresh()
  }

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  return (
    <div className="flex flex-col gap-2">
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`rounded-lg border-2 border-dashed transition-colors p-6 text-center ${
          dragOver
            ? "border-accent bg-[var(--color-pending-surface)]"
            : "border-border bg-surface-raised"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          onChange={onChange}
          className="hidden"
          id={`upload-${taskId ?? "global"}`}
        />
        <div className="flex flex-col items-center gap-3">
          <div className="text-3xl opacity-50" aria-hidden>📎</div>
          <div>
            <div className="text-sm font-medium text-[var(--color-text)] mb-1">
              גרור קובץ לכאן, או
            </div>
            <label htmlFor={`upload-${taskId ?? "global"}`} className="inline-block">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                loading={uploading}
                onClick={() => inputRef.current?.click()}
              >
                בחר קובץ מהמחשב
              </Button>
            </label>
          </div>
          <p className="text-xs text-muted-foreground">
            PDF, JPG, PNG, DOC/DOCX · עד 10MB
          </p>
        </div>
      </div>
      {error && (
        <p role="alert" className="text-xs text-[oklch(50%_0.18_25)]">
          {error}
        </p>
      )}
    </div>
  )
}
