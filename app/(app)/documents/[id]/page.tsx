import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth"
import { prisma } from "@/lib/db/prisma"
import { Header } from "@/components/layout/Header"
import { Card } from "@/components/ui/Card"
import { ExtractFieldsForm } from "@/components/documents/ExtractFieldsForm"
import { findDocType } from "@/lib/documents/docTypes"

interface Props {
  params: { id: string }
}

export const metadata = { title: "פרטי מסמך — MoveEasy Israel" }

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default async function DocumentDetailPage({ params }: Props) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId) redirect("/login")

  const doc = await prisma.document.findUnique({
    where: { id: params.id },
    include: {
      task: { select: { id: true, workflowStep: { select: { title: true } } } },
    },
  })
  if (!doc) notFound()
  if (doc.userId !== userId) redirect("/documents")

  const docType = findDocType(doc.docType)
  const fields = (doc.extractedFields as Record<string, string | number | null> | null) ?? null

  return (
    <>
      <Header title={doc.filename} subtitle={docType ? docType.label : "מסמך"} />
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-2xl mx-auto flex flex-col gap-6">
          <Link
            href={doc.task ? `/tasks/${doc.task.id}` : "/documents"}
            className="text-sm text-accent hover:underline underline-offset-2"
          >
            ← חזרה
          </Link>

          <Card padding="lg" className="flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <div className="text-3xl shrink-0" aria-hidden>📄</div>
              <div className="flex-1 min-w-0">
                <div className="font-display text-lg font-medium text-[var(--color-text)] truncate">
                  {doc.filename}
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatSize(doc.sizeBytes)} · {new Date(doc.uploadedAt).toLocaleDateString("he-IL")}
                  {doc.task && (
                    <>
                      {" · "}
                      <Link
                        href={`/tasks/${doc.task.id}`}
                        className="text-accent hover:underline underline-offset-2"
                      >
                        {doc.task.workflowStep.title}
                      </Link>
                    </>
                  )}
                </div>
              </div>
              <a
                href={`/api/documents/${doc.id}/file`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-accent hover:underline underline-offset-2 shrink-0"
              >
                צפה בקובץ
              </a>
            </div>
          </Card>

          <Card padding="lg">
            <div className="mb-4">
              <h3 className="font-display text-base font-medium text-[var(--color-text)] mb-1">
                פרטי המסמך
              </h3>
              <p className="text-xs text-muted-foreground">
                מילוי הפרטים פעם אחת — יעזור לך להעתיק נתונים לטפסים אחרים.
              </p>
            </div>
            <ExtractFieldsForm
              documentId={doc.id}
              initialDocType={doc.docType}
              initialFields={fields}
            />
          </Card>
        </div>
      </div>
    </>
  )
}
