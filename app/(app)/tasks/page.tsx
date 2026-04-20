import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth"
import { prisma } from "@/lib/db/prisma"
import Link from "next/link"
import { cn } from "@/lib/utils"
import type { TaskStatus } from "@/types"

export const metadata = { title: "משימות Follow-up — ClinicFlow AI" }

const STATUS_LABEL: Record<TaskStatus, string> = {
  PENDING:     "ממתינות",
  IN_PROGRESS: "בטיפול",
  DONE:        "הושלמו",
  SKIPPED:     "דולגו",
}

const STATUS_COLOR: Record<TaskStatus, string> = {
  PENDING:     "bg-amber-100 text-amber-800",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  DONE:        "bg-green-100 text-green-800",
  SKIPPED:     "bg-gray-100 text-gray-500",
}

export default async function TasksPage() {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId) redirect("/login")

  const tasks = await prisma.task.findMany({
    where: {
      userId,
      leadId: { not: null },
    },
    include: {
      workflowStep: { select: { title: true, description: true } },
      lead: {
        include: {
          client: { select: { name: true, treatmentWanted: true } },
        },
      },
    },
    orderBy: [{ status: "asc" }, { createdAt: "asc" }],
  })

  const statusOrder: TaskStatus[] = ["PENDING", "IN_PROGRESS", "DONE", "SKIPPED"]
  const grouped = new Map<TaskStatus, typeof tasks>()
  for (const s of statusOrder) grouped.set(s, [])
  for (const t of tasks) grouped.get(t.status as TaskStatus)?.push(t)

  const pending = tasks.filter((t) => t.status === "PENDING" || t.status === "IN_PROGRESS").length
  const done = tasks.filter((t) => t.status === "DONE").length

  return (
    <div className="flex-1 overflow-auto bg-[var(--color-surface)] p-6 lg:p-8" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-[var(--color-text)]">
            משימות Follow-up
          </h1>
          <p className="text-sm text-[var(--color-muted-fg)] mt-1">
            {tasks.length === 0
              ? "אין משימות עדיין — צור ליד ראשון"
              : `${pending} פתוחות · ${done} הושלמו`}
          </p>
        </div>
        <Link
          href="/leads"
          className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
          style={{ background: "var(--color-highlight)" }}
        >
          + ליד חדש
        </Link>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-24 text-[var(--color-muted-fg)]">
          <p className="text-4xl mb-4">✓</p>
          <p className="font-semibold text-[var(--color-text)] mb-2">אין משימות עדיין</p>
          <p className="text-sm mb-6">הוסף ליד ראשון — המערכת תיצור משימות follow-up אוטומטית</p>
          <Link
            href="/leads"
            className="inline-flex items-center px-5 py-2.5 rounded-lg text-sm font-semibold text-white"
            style={{ background: "var(--color-highlight)" }}
          >
            + ליד חדש
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {statusOrder.map((status) => {
            const group = grouped.get(status)!
            if (group.length === 0) return null
            return (
              <section key={status}>
                <h2 className="text-xs uppercase tracking-widest font-bold text-[var(--color-muted-fg)] mb-3">
                  {STATUS_LABEL[status]} ({group.length})
                </h2>
                <div className="flex flex-col gap-2">
                  {group.map((task) => (
                    <div
                      key={task.id}
                      className={cn(
                        "flex items-center justify-between p-4 rounded-xl border bg-surface-raised shadow-card",
                        "border-border"
                      )}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-sm font-semibold text-[var(--color-text)]">
                            {task.workflowStep?.title ?? "משימה"}
                          </p>
                        </div>
                        <p className="text-xs text-[var(--color-muted-fg)]">
                          {task.lead?.client?.name ?? "לקוח"}
                          {task.lead?.client?.treatmentWanted
                            ? ` · ${task.lead.client.treatmentWanted}`
                            : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={cn(
                            "text-xs font-semibold px-2.5 py-0.5 rounded-full",
                            STATUS_COLOR[task.status as TaskStatus]
                          )}
                        >
                          {STATUS_LABEL[task.status as TaskStatus]}
                        </span>
                        {task.lead?.id && (
                          <Link
                            href={`/leads/${task.lead.id}`}
                            className="text-xs text-[var(--color-muted-fg)] hover:text-[var(--color-highlight)] transition-colors"
                          >
                            ← ליד
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}
