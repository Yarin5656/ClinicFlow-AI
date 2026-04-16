"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export interface DocumentItem {
  id: string
  filename: string
  mimeType: string
  sizeBytes: number
  uploadedAt: Date | string
}

interface Props {
  documents: DocumentItem[]
  emptyLabel?: string
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(value: Date | string): string {
  return new Date(value).toLocaleDateString("he-IL", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

function fileIcon(mimeType: string): string {
  if (mimeType.startsWith("image/")) return "🖼️"
  if (mimeType === "application/pdf") return "📄"
  if (mimeType.includes("word")) return "📝"
  return "📎"
}

export function DocumentList({ documents, emptyLabel = "לא הועלו מסמכים עדיין" }: Props) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm("למחוק את המסמך הזה? פעולה זו לא ניתנת לביטול.")) return
    setDeletingId(id)

    const res = await fetch(`/api/documents/${id}`, { method: "DELETE" })
    if (!res.ok) {
      alert("המחיקה נכשלה. נסה שוב.")
      setDeletingId(null)
      return
    }

    router.refresh()
    // deletingId is implicitly cleared when component re-renders without this id
  }

  if (documents.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyLabel}</p>
  }

  return (
    <ul className="flex flex-col gap-2">
      {documents.map((doc) => {
        const deleting = deletingId === doc.id
        return (
          <li
            key={doc.id}
            className="flex items-center gap-3 rounded-md border border-border bg-surface-raised p-3"
          >
            <div className="text-2xl shrink-0" aria-hidden>
              {fileIcon(doc.mimeType)}
            </div>
            <div className="flex-1 min-w-0">
              <a
                href={`/api/documents/${doc.id}/file`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-[var(--color-text)] hover:text-primary truncate block"
              >
                {doc.filename}
              </a>
              <div className="text-xs text-muted-foreground">
                {formatSize(doc.sizeBytes)} · {formatDate(doc.uploadedAt)}
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleDelete(doc.id)}
              disabled={deleting}
              className="text-sm text-muted-foreground hover:text-[oklch(50%_0.18_25)] disabled:opacity-50 transition-colors px-2 py-1 rounded"
            >
              {deleting ? "מוחק..." : "מחק"}
            </button>
          </li>
        )
      })}
    </ul>
  )
}
