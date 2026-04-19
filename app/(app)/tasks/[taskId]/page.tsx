import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth"
import { prisma } from "@/lib/db/prisma"
import { PageHero } from "@/components/layout/PageHero"
import { Card } from "@/components/ui/Card"
import { StatusStamp } from "@/components/ui/StatusStamp"
import { StatusToggle } from "@/components/tasks/StatusToggle"
import { TaskNotes } from "@/components/tasks/TaskNotes"
import { UploadZone } from "@/components/documents/UploadZone"
import { DocumentList } from "@/components/documents/DocumentList"
import { CreateReminderForm } from "@/components/reminders/CreateReminderForm"
import { CopyField } from "@/components/ui/CopyField"
import type { TaskStatus, RequiredDocument, ExternalLink } from "@/types"

interface Props {
  params: { taskId: string }
}

export default async function TaskDetailPage({ params }: Props) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId) redirect("/login")

  const [task, userProfile, household] = await Promise.all([
    prisma.task.findUnique({
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
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, idNumber: true, phoneNumber: true, birthDate: true },
    }),
    prisma.household.findUnique({
      where: { userId },
      select: { toAddress: true, fromAddress: true },
    }),
  ])

  if (!task) notFound()
  if (task.userId !== userId) redirect("/dashboard")

  const step = task.workflowStep
  const workflow = step.workflow
  const requiredDocs = (step.requiredDocuments as RequiredDocument[] | null) ?? []
  const externalLinks = (step.externalLinks as ExternalLink[] | null) ?? []
  const status = task.status as TaskStatus
  const isDone = status === "DONE"
  const formatBirthDate = (d: Date | null): string | null =>
    d ? d.toLocaleDateString("he-IL") : null

  return (
    <div className="flex-1 overflow-auto">
      <PageHero
        eyebrow={`${workflow.title} · שלב ${step.order}`}
        title={step.title}
        subtitle={
          <p className="max-w-2xl leading-relaxed">{step.description}</p>
        }
        right={
          <div className="flex flex-col items-end gap-3">
            {isDone && <StatusStamp status="DONE" size="md" rotate={-10} />}
            <Link
              href={`/tasks?workflow=${workflow.slug}`}
              className="inline-flex items-center gap-1.5 text-sm text-white/80 hover:text-white transition-colors"
            >
              <span aria-hidden>←</span> כל המשימות ב{workflow.title}
            </Link>
          </div>
        }
      />

      <div className="max-w-3xl mx-auto px-6 lg:px-8 py-8 lg:py-10 flex flex-col gap-5">
        {/* Status toggle */}
        <Card
          padding="lg"
          className="flex flex-col gap-5"
          style={{ viewTransitionName: `task-${task.id}` }}
        >
          <StatusToggle taskId={task.id} initialStatus={status} />
        </Card>

        {/* Profile copy card */}
        <Card padding="lg" className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between gap-2 flex-wrap">
            <div>
              <h3 className="font-display text-base font-bold text-[var(--color-text)]">
                הפרטים שלך להעתקה מהירה
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                לחץ על שדה כדי להעתיק. חסר משהו?{" "}
                <Link
                  href="/settings"
                  className="text-[var(--color-highlight)] hover:underline underline-offset-2 font-medium"
                >
                  השלם בפרופיל
                </Link>
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <CopyField label="שם מלא" value={userProfile?.name} />
            <CopyField label="ת.ז" value={userProfile?.idNumber} />
            <CopyField label="טלפון" value={userProfile?.phoneNumber} />
            <CopyField label="תאריך לידה" value={formatBirthDate(userProfile?.birthDate ?? null)} />
            <CopyField label="כתובת חדשה" value={household?.toAddress} />
            <CopyField label="כתובת קודמת" value={household?.fromAddress} />
          </div>
        </Card>

        {/* Required documents */}
        {requiredDocs.length > 0 && (
          <Card padding="lg" className="flex flex-col gap-3">
            <h3 className="font-display text-base font-bold text-[var(--color-text)]">
              מסמכים נדרשים
            </h3>
            <ul className="flex flex-col gap-2">
              {requiredDocs.map((doc, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <div
                    className="h-5 w-5 rounded-full border-2 border-border bg-surface mt-0.5 shrink-0"
                    aria-hidden
                  />
                  <div className="flex-1">
                    <div className="font-medium text-[var(--color-text)]">
                      {doc.name}
                      {doc.required && (
                        <span className="text-[oklch(50%_0.18_25)] mr-1">*</span>
                      )}
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

        {/* Documents upload */}
        <Card padding="lg" className="flex flex-col gap-4">
          <div className="flex items-baseline justify-between">
            <h3 className="font-display text-base font-bold text-[var(--color-text)]">
              המסמכים שלך
            </h3>
            <span className="text-xs text-muted-foreground">
              {task.documents.length}{" "}
              {task.documents.length === 1 ? "מסמך" : "מסמכים"}
            </span>
          </div>
          <DocumentList
            documents={task.documents}
            emptyLabel="טרם העלית מסמכים למשימה זו"
          />
          <UploadZone taskId={task.id} />
        </Card>

        {/* External links */}
        {externalLinks.length > 0 && (
          <Card padding="lg" className="flex flex-col gap-3">
            <h3 className="font-display text-base font-bold text-[var(--color-text)]">
              קישורים רשמיים
            </h3>
            <ul className="flex flex-col gap-2">
              {externalLinks.map((link, i) => (
                <li key={i}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface p-3 hover:border-[var(--color-highlight)] hover:bg-[var(--color-highlight-soft)] transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-lg shrink-0" aria-hidden>
                        {link.category === "official" ? "🏛️" : "ℹ️"}
                      </span>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-[var(--color-text)] truncate">
                          {link.label}
                        </div>
                        <div className="text-xs text-muted-foreground truncate" dir="ltr">
                          {link.url.replace(/^https?:\/\//, "")}
                        </div>
                      </div>
                    </div>
                    <span
                      className="text-[var(--color-highlight)] font-bold group-hover:-translate-x-1 transition-transform shrink-0"
                      aria-hidden
                    >
                      ←
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* Helper notes */}
        {step.helperNotes && (
          <div
            className="rounded-2xl border p-4 flex gap-3"
            style={{
              background: "color-mix(in oklch, var(--color-highlight) 6%, transparent)",
              borderColor: "color-mix(in oklch, var(--color-highlight) 30%, transparent)",
            }}
          >
            <span className="text-lg shrink-0" aria-hidden>
              💡
            </span>
            <p className="text-sm leading-relaxed text-[var(--color-text)]">
              {step.helperNotes}
            </p>
          </div>
        )}

        {/* Reminder + notes */}
        <Card padding="lg" className="flex flex-col gap-3">
          <div>
            <h3 className="font-display text-base font-bold text-[var(--color-text)]">
              תזכורת למשימה
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              נודיע לך בפעמון כשיגיע הזמן
            </p>
          </div>
          <CreateReminderForm taskId={task.id} suggestion={step.title} />
        </Card>

        <Card padding="lg">
          <TaskNotes taskId={task.id} initialNotes={task.notes ?? ""} />
        </Card>
      </div>
    </div>
  )
}
