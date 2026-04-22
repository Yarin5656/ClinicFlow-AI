import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth"
import { prisma } from "@/lib/db/prisma"
import { Link } from "@/lib/i18n/navigation"
import { cn } from "@/lib/utils"
import type { TaskStatus } from "@/types"
import { getTranslations } from "next-intl/server"

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: "tasks" })
  return { title: `${t("title")} — ClinicFlow AI` }
}

const STATUS_COLOR: Record<TaskStatus, string> = {
  PENDING:     "bg-amber-100 text-amber-800",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  DONE:        "bg-green-100 text-green-800",
  SKIPPED:     "bg-gray-100 text-gray-500",
}

export default async function TasksPage({ params }: { params: { locale: string } }) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId) redirect(`/${params.locale}/login`)

  const t = await getTranslations({ locale: params.locale, namespace: "tasks" })
  const tStatus = await getTranslations({ locale: params.locale, namespace: "taskStatus" })

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
  for (const task of tasks) grouped.get(task.status as TaskStatus)?.push(task)

  const pending = tasks.filter((task) => task.status === "PENDING" || task.status === "IN_PROGRESS").length
  const done = tasks.filter((task) => task.status === "DONE").length

  return (
    <div className="flex-1 overflow-auto bg-[var(--color-surface)] p-6 lg:p-8" dir={params.locale === "he" ? "rtl" : "ltr"}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-[var(--color-text)]">
            {t("title")}
          </h1>
          <p className="text-sm text-[var(--color-muted-fg)] mt-1">
            {tasks.length === 0
              ? t("noTasks")
              : `${t("pendingOpen", { count: pending })} · ${t("done", { count: done })}`}
          </p>
        </div>
        <Link
          href="/leads"
          className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
          style={{ background: "var(--color-highlight)" }}
        >
          {t("addFirstLead")}
        </Link>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-24 text-[var(--color-muted-fg)]">
          <p className="text-4xl mb-4">✓</p>
          <p className="font-semibold text-[var(--color-text)] mb-2">{t("empty")}</p>
          <p className="text-sm mb-6">{t("emptyDesc")}</p>
          <Link
            href="/leads"
            className="inline-flex items-center px-5 py-2.5 rounded-lg text-sm font-semibold text-white"
            style={{ background: "var(--color-highlight)" }}
          >
            {t("addFirstLead")}
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
                  {tStatus(status)} ({group.length})
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
                            {task.workflowStep?.title ?? t("task")}
                          </p>
                        </div>
                        <p className="text-xs text-[var(--color-muted-fg)]">
                          {task.lead?.client?.name ?? t("client")}
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
                          {tStatus(task.status as TaskStatus)}
                        </span>
                        {task.lead?.id && (
                          <Link
                            href={`/leads/${task.lead.id}`}
                            className="text-xs text-[var(--color-muted-fg)] hover:text-[var(--color-highlight)] transition-colors"
                          >
                            {t("backToLead")}
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
