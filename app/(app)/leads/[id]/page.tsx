import { redirect, notFound } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth"
import { prisma } from "@/lib/db/prisma"
import Link from "next/link"

export const metadata = { title: "ליד — ClinicFlow AI" }

const PIPELINE: Array<{ status: string; label: string }> = [
  { status: "NEW",       label: "ליד חדש" },
  { status: "FOLLOW_UP", label: "follow-up" },
  { status: "QUOTED",    label: "הצעת מחיר" },
  { status: "BOOKED",    label: "נקבע תור" },
  { status: "WON",       label: "נסגר" },
]

const TASK_STATUS_LABELS: Record<string, string> = {
  PENDING: "ממתין", IN_PROGRESS: "בטיפול", DONE: "הושלם", SKIPPED: "דולג",
}

export default async function LeadDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId) redirect("/login")

  const lead = await prisma.lead.findUnique({
    where: { id: params.id },
    include: {
      client: true,
      tasks: {
        include: { workflowStep: { select: { title: true, description: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  })

  if (!lead || lead.client.userId !== userId) notFound()

  const currentStepIndex = PIPELINE.findIndex((s) => s.status === lead.status)

  return (
    <div className="flex-1 overflow-auto bg-[var(--color-surface)] p-6 lg:p-8" dir="rtl">
      <p className="text-xs text-[var(--color-muted-fg)] mb-3">
        <Link href="/leads" className="hover:underline">לידים</Link> › {lead.client.name}
      </p>

      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="font-display text-2xl font-bold text-[var(--color-text)]">{lead.client.name}</h1>
          <p className="text-sm text-[var(--color-muted-fg)] mt-1">
            {lead.client.phone} · {lead.client.source ?? "—"} · נכנס {lead.createdAt.toLocaleDateString("he-IL")}
          </p>
        </div>
        <Link href="/leads" className="px-4 py-1.5 text-sm rounded-lg font-semibold text-white" style={{ background: "var(--color-highlight)" }}>
          + ליד חדש
        </Link>
      </div>

      <div className="flex gap-2 mb-6">
        {PIPELINE.map((step, i) => {
          const isDone = i < currentStepIndex
          const isActive = i === currentStepIndex
          return (
            <div
              key={step.status}
              className={`flex-1 text-center py-2 px-3 rounded-lg text-xs font-semibold border-2 ${
                isDone
                  ? "bg-green-50 text-green-700 border-green-200"
                  : isActive
                  ? "border-[var(--color-highlight)] text-white"
                  : "bg-[var(--color-surface)] text-[var(--color-muted-fg)] border-border"
              }`}
              style={isActive ? { background: "oklch(22% 0.07 245)" } : {}}
            >
              {isDone ? "✓ " : ""}{step.label}
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 flex flex-col gap-5">
          {lead.aiSummary && (
            <div className="rounded-2xl p-5" style={{ background: "oklch(22% 0.07 245)" }}>
              <p className="text-xs font-semibold mb-2 text-[var(--color-highlight)]">✦ סיכום AI של הפנייה</p>
              <p className="text-sm leading-relaxed text-white/80">{lead.aiSummary}</p>
              {lead.aiTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {lead.aiTags.map((tag) => (
                    <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/70">{tag}</span>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="bg-surface-raised rounded-2xl border border-border p-5 shadow-card">
            <h2 className="text-xs uppercase tracking-wide text-[var(--color-muted-fg)] font-semibold mb-4">פרטי לקוח</h2>
            {[
              ["שם מלא", lead.client.name],
              ["טלפון", lead.client.phone],
              ["מקור", lead.client.source ?? "—"],
              ["טיפול מבוקש", lead.client.treatmentWanted ?? "—"],
              ["הערות", lead.client.notes ?? "—"],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between items-start py-2 border-b border-border/50 last:border-0 text-sm">
                <span className="text-[var(--color-muted-fg)]">{label}</span>
                <span className="text-[var(--color-text)] font-medium text-right max-w-[60%]">{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div className="bg-surface-raised rounded-2xl border border-border p-5 shadow-card">
            <h2 className="text-xs uppercase tracking-wide text-[var(--color-muted-fg)] font-semibold mb-4">משימות follow-up</h2>
            <div className="flex flex-col gap-2">
              {lead.tasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-surface)] border border-border">
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-text)]">{task.workflowStep?.title ?? "משימה"}</p>
                    <p className="text-xs text-[var(--color-muted-fg)] mt-0.5">{task.workflowStep?.description ?? ""}</p>
                  </div>
                  <span className="text-xs text-[var(--color-muted-fg)] font-medium ml-3 shrink-0">
                    {TASK_STATUS_LABELS[task.status] ?? task.status}
                  </span>
                </div>
              ))}
              {lead.tasks.length === 0 && (
                <p className="text-sm text-[var(--color-muted-fg)]">אין משימות</p>
              )}
            </div>
          </div>

          <div className="bg-surface-raised rounded-2xl border border-border p-5 shadow-card">
            <h2 className="text-xs uppercase tracking-wide text-[var(--color-muted-fg)] font-semibold mb-4">היסטוריה</h2>
            <div className="flex flex-col gap-3">
              <div className="flex gap-3 items-start">
                <span className="w-2 h-2 rounded-full mt-1.5 shrink-0 bg-[var(--color-highlight)]" />
                <div>
                  <p className="text-sm text-[var(--color-text)]">ליד נכנס</p>
                  <p className="text-xs text-[var(--color-muted-fg)]">{lead.createdAt.toLocaleString("he-IL")}</p>
                </div>
              </div>
              {lead.aiSummary && (
                <div className="flex gap-3 items-start">
                  <span className="w-2 h-2 rounded-full mt-1.5 shrink-0 bg-[var(--color-highlight)]" />
                  <div>
                    <p className="text-sm text-[var(--color-text)]">AI סיכם את הפנייה ויצר משימות follow-up</p>
                    <p className="text-xs text-[var(--color-muted-fg)]">{lead.createdAt.toLocaleString("he-IL")}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
