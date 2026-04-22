import { redirect, notFound } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth"
import { prisma } from "@/lib/db/prisma"
import { Link } from "@/lib/i18n/navigation"
import { getTranslations } from "next-intl/server"

export async function generateMetadata({ params }: { params: { locale: string; id: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: "leads" })
  return { title: `${t("breadcrumb")} — ClinicFlow AI` }
}

const PIPELINE_STATUSES = ["NEW", "FOLLOW_UP", "QUOTED", "BOOKED", "WON"]

const TASK_STATUS_CLASSES: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  DONE: "bg-green-100 text-green-800",
  SKIPPED: "bg-gray-100 text-gray-500",
}

export default async function LeadDetailPage({ params }: { params: { locale: string; id: string } }) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId) redirect(`/${params.locale}/login`)

  const t = await getTranslations({ locale: params.locale, namespace: "leads" })
  const tPipeline = await getTranslations({ locale: params.locale, namespace: "pipeline" })
  const tTaskStatus = await getTranslations({ locale: params.locale, namespace: "taskStatusSingle" })
  const dateLocale = params.locale === "he" ? "he-IL" : params.locale === "ru" ? "ru-RU" : "en-US"

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

  const currentStepIndex = PIPELINE_STATUSES.findIndex((s) => s === lead.status)

  return (
    <div className="flex-1 overflow-auto bg-[var(--color-surface)] p-6 lg:p-8" dir={params.locale === "he" ? "rtl" : "ltr"}>
      <p className="text-xs text-[var(--color-muted-fg)] mb-3">
        <Link href="/leads" className="hover:underline">{t("breadcrumb")}</Link> › {lead.client.name}
      </p>

      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="font-display text-2xl font-bold text-[var(--color-text)]">{lead.client.name}</h1>
          <p className="text-sm text-[var(--color-muted-fg)] mt-1">
            {lead.client.phone} · {lead.client.source ?? "—"} · {t("leadEntered")} {lead.createdAt.toLocaleDateString(dateLocale)}
          </p>
        </div>
        <Link href="/leads" className="px-4 py-1.5 text-sm rounded-lg font-semibold text-white" style={{ background: "var(--color-highlight)" }}>
          {t("newLead" as never)}
        </Link>
      </div>

      <div className="flex gap-2 mb-6">
        {PIPELINE_STATUSES.map((status, i) => {
          const isDone = i < currentStepIndex
          const isActive = i === currentStepIndex
          return (
            <div
              key={status}
              className={`flex-1 text-center py-2 px-3 rounded-lg text-xs font-semibold border-2 ${
                isDone
                  ? "bg-green-50 text-green-700 border-green-200"
                  : isActive
                  ? "border-[var(--color-highlight)] text-white"
                  : "bg-[var(--color-surface)] text-[var(--color-muted-fg)] border-border"
              }`}
              style={isActive ? { background: "oklch(22% 0.07 245)" } : {}}
            >
              {isDone ? "✓ " : ""}{tPipeline(status as "NEW" | "FOLLOW_UP" | "QUOTED" | "BOOKED" | "WON")}
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 flex flex-col gap-5">
          {lead.aiSummary && (
            <div className="rounded-2xl p-5" style={{ background: "oklch(22% 0.07 245)" }}>
              <p className="text-xs font-semibold mb-2 text-[var(--color-highlight)]">{t("aiSummaryTitle")}</p>
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
            <h2 className="text-xs uppercase tracking-wide text-[var(--color-muted-fg)] font-semibold mb-4">{t("clientDetails")}</h2>
            {[
              [t("fullName"), lead.client.name],
              [t("phone" as never), lead.client.phone],
              [t("source" as never), lead.client.source ?? "—"],
              [t("treatmentWanted"), lead.client.treatmentWanted ?? "—"],
              [t("notes"), lead.client.notes ?? "—"],
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
            <h2 className="text-xs uppercase tracking-wide text-[var(--color-muted-fg)] font-semibold mb-4">{t("followupTasks")}</h2>
            <div className="flex flex-col gap-2">
              {lead.tasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-surface)] border border-border">
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-text)]">{task.workflowStep?.title ?? "משימה"}</p>
                    <p className="text-xs text-[var(--color-muted-fg)] mt-0.5">{task.workflowStep?.description ?? ""}</p>
                  </div>
                  <span className={`text-xs font-medium ml-3 shrink-0 px-2 py-0.5 rounded-full ${TASK_STATUS_CLASSES[task.status] ?? "text-[var(--color-muted-fg)]"}`}>
                    {tTaskStatus(task.status as "PENDING" | "IN_PROGRESS" | "DONE" | "SKIPPED")}
                  </span>
                </div>
              ))}
              {lead.tasks.length === 0 && (
                <p className="text-sm text-[var(--color-muted-fg)]">{t("noTasks")}</p>
              )}
            </div>
          </div>

          <div className="bg-surface-raised rounded-2xl border border-border p-5 shadow-card">
            <h2 className="text-xs uppercase tracking-wide text-[var(--color-muted-fg)] font-semibold mb-4">{t("history")}</h2>
            <div className="flex flex-col gap-3">
              <div className="flex gap-3 items-start">
                <span className="w-2 h-2 rounded-full mt-1.5 shrink-0 bg-[var(--color-highlight)]" />
                <div>
                  <p className="text-sm text-[var(--color-text)]">{t("leadEntered")}</p>
                  <p className="text-xs text-[var(--color-muted-fg)]">{lead.createdAt.toLocaleString(dateLocale)}</p>
                </div>
              </div>
              {lead.aiSummary && (
                <div className="flex gap-3 items-start">
                  <span className="w-2 h-2 rounded-full mt-1.5 shrink-0 bg-[var(--color-highlight)]" />
                  <div>
                    <p className="text-sm text-[var(--color-text)]">{t("aiSummarized")}</p>
                    <p className="text-xs text-[var(--color-muted-fg)]">{lead.createdAt.toLocaleString(dateLocale)}</p>
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
