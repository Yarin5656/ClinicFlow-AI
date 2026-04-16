import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth"
import { prisma } from "@/lib/db/prisma"
import { Header } from "@/components/layout/Header"
import { Card } from "@/components/ui/Card"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { StatusToggle } from "@/components/tasks/StatusToggle"
import { TaskNotes } from "@/components/tasks/TaskNotes"
import { UploadZone } from "@/components/documents/UploadZone"
import { DocumentList } from "@/components/documents/DocumentList"
import type { TaskStatus, RequiredDocument, ExternalLink } from "@/types"

interface Props {
  params: { taskId: string }
}

export default async function TaskDetailPage({ params }: Props) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId) redirect("/login")

  const task = await prisma.task.findUnique({
    where: { id: params.taskId },
    include: {
      workflowStep: {
        include: { workflow: { select: { slug: true, title: true } } },
      },
      documents: {
        select: {
          id: true,
          filename: true,
          mimeType: true,
          sizeBytes: true,
          uploadedAt: true,
        },
        orderBy: { uploadedAt: "desc" },
      },
    },
  })

  if (!task) notFound()
  if (task.userId !== userId) redirect("/dashboard")

  const step = task.workflowStep
  const workflow = step.workflow
  const requiredDocs = (step.requiredDocuments as RequiredDocument[] | null) ?? []
  const externalLinks = (step.externalLinks as ExternalLink[] | null) ?? []

  return (
    <>
      <Header
        title={workflow.title}
        subtitle={`שלב ${step.order}: ${step.title}`}
      />
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-3xl mx-auto flex flex-col gap-6">
          <div>
            <Link
              href={`/tasks?workflow=${workflow.slug}`}
              className="text-sm text-accent hover:underline underline-offset-2"
            >
              ← חזרה לרשימת המשימות
            </Link>
          </div>

          {/* Title + description + status toggle */}
          <Card padding="lg" className="flex flex-col gap-5">
            <div className="flex items-start gap-3 flex-wrap">
              <div className="flex-1 min-w-[240px]">
                <h2 className="font-display text-2xl font-medium text-[var(--color-text)] mb-2 leading-tight">
                  {step.title}
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
              <StatusBadge status={task.status as TaskStatus} className="mt-1" />
            </div>
            <StatusToggle taskId={task.id} initialStatus={task.status as TaskStatus} />
          </Card>

          {/* Required documents checklist */}
          {requiredDocs.length > 0 && (
            <Card padding="lg" className="flex flex-col gap-3">
              <h3 className="font-display text-base font-medium text-[var(--color-text)]">
                מסמכים נדרשים
              </h3>
              <ul className="flex flex-col gap-2">
                {requiredDocs.map((doc, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <div className="h-5 w-5 rounded-full border-2 border-border bg-surface mt-0.5 shrink-0" aria-hidden />
                    <div className="flex-1">
                      <div className="font-medium text-[var(--color-text)]">
                        {doc.name}
                        {doc.required && <span className="text-[oklch(50%_0.18_25)] mr-1">*</span>}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {doc.description}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-muted-foreground">
                * סימון זה מציין מסמך חובה
              </p>
            </Card>
          )}

          {/* Upload + document list */}
          <Card padding="lg" className="flex flex-col gap-4">
            <div className="flex items-baseline justify-between">
              <h3 className="font-display text-base font-medium text-[var(--color-text)]">
                המסמכים שלך
              </h3>
              <span className="text-xs text-muted-foreground">
                {task.documents.length} {task.documents.length === 1 ? "מסמך" : "מסמכים"}
              </span>
            </div>
            <DocumentList documents={task.documents} emptyLabel="טרם העלית מסמכים למשימה זו" />
            <UploadZone taskId={task.id} />
          </Card>

          {/* External links */}
          {externalLinks.length > 0 && (
            <Card padding="lg" className="flex flex-col gap-3">
              <h3 className="font-display text-base font-medium text-[var(--color-text)]">
                קישורים רשמיים
              </h3>
              <ul className="flex flex-col gap-2">
                {externalLinks.map((link, i) => (
                  <li key={i}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between gap-3 rounded-md border border-border bg-surface-raised p-3 hover:border-accent hover:bg-[var(--color-pending-surface)] transition-colors group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-lg shrink-0" aria-hidden>
                          {link.category === "official" ? "🏛️" : "ℹ️"}
                        </span>
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-[var(--color-text)] truncate">
                            {link.label}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {link.url.replace(/^https?:\/\//, "")}
                          </div>
                        </div>
                      </div>
                      <span className="text-accent group-hover:-translate-x-0.5 transition-transform shrink-0" aria-hidden>
                        ←
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Helper notes (service notes) */}
          {step.helperNotes && (
            <div className="rounded-lg bg-[var(--color-pending-surface)] text-[var(--color-pending)] border border-[var(--color-pending)]/20 p-4 flex gap-3">
              <span className="text-lg shrink-0" aria-hidden>💡</span>
              <p className="text-sm leading-relaxed text-[var(--color-text)]">
                {step.helperNotes}
              </p>
            </div>
          )}

          {/* User notes (auto-save) */}
          <Card padding="lg">
            <TaskNotes taskId={task.id} initialNotes={task.notes ?? ""} />
          </Card>
        </div>
      </div>
    </>
  )
}
