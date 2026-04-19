"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "motion/react"
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
  const [celebrate, setCelebrate] = useState(false)

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
    // Celebration moment on success — checkmark pops in, fades out after 1.2s
    setCelebrate(true)
    setTimeout(() => setCelebrate(false), 1200)
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
        className={`relative rounded-lg border-2 border-dashed transition-all duration-200 p-6 text-center ${
          dragOver
            ? "border-[var(--color-highlight)] bg-highlight-soft scale-[1.01]"
            : "border-border bg-surface-raised"
        }`}
      >
        <AnimatePresence>
          {celebrate && (
            <motion.div
              initial={{ opacity: 0, scale: 0.3 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
              transition={{ type: "spring", stiffness: 300, damping: 18 }}
              className="absolute inset-0 flex items-center justify-center bg-surface-raised/90 backdrop-blur-sm rounded-lg z-10"
            >
              <motion.div
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 280, damping: 14, delay: 0.05 }}
                className="flex items-center gap-2 text-[var(--color-highlight)] font-semibold text-lg"
              >
                <span className="flex items-center justify-center w-10 h-10 rounded-full bg-[var(--color-highlight)] text-[var(--color-highlight-fg)] text-xl">
                  ✓
                </span>
                הקובץ הועלה
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
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
