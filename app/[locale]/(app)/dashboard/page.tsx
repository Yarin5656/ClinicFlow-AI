import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth"
import { prisma } from "@/lib/db/prisma"
import { Link } from "@/lib/i18n/navigation"
import { getTranslations } from "next-intl/server"

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: "dashboard" })
  return { title: `${t("title")} — ClinicFlow AI` }
}

const STATUS_CLASSES: Record<string, string> = {
  NEW: "bg-blue-100 text-blue-700", FOLLOW_UP: "bg-amber-100 text-amber-800",
  QUOTED: "bg-purple-100 text-purple-800", BOOKED: "bg-green-100 text-green-800",
  WON: "bg-emerald-100 text-emerald-800", LOST: "bg-red-100 text-red-800",
}

export default async function DashboardPage({ params }: { params: { locale: string } }) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId) redirect(`/${params.locale}/login`)

  const t = await getTranslations({ locale: params.locale, namespace: "dashboard" })
  const tStatus = await getTranslations({ locale: params.locale, namespace: "leadStatus" })

  const firstName = (session?.user?.name ?? "").split(" ")[0] || "משתמש"
  const today = new Date()
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const dateLocale = params.locale === "he" ? "he-IL" : params.locale === "ru" ? "ru-RU" : "en-US"

  const [newLeadsToday, totalPending, overdueCount, bookedThisMonth, recentLeads, urgentTasks] =
    await Promise.all([
      prisma.lead.count({
        where: { client: { userId }, createdAt: { gte: todayStart } },
      }),
      prisma.lead.count({
        where: { client: { userId }, status: { notIn: ["WON", "LOST"] } },
      }),
      prisma.task.count({
        where: {
          userId,
          leadId: { not: null },
          status: { in: ["PENDING", "IN_PROGRESS"] },
          dueDate: { lt: today },
        },
      }),
      prisma.lead.count({
        where: {
          client: { userId },
          status: "BOOKED",
          updatedAt: { gte: new Date(today.getFullYear(), today.getMonth(), 1) },
        },
      }),
      prisma.lead.findMany({
        where: { client: { userId } },
        include: { client: { select: { name: true, phone: true, source: true, treatmentWanted: true } } },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      prisma.task.findMany({
        where: {
          userId,
          leadId: { not: null },
          status: { in: ["PENDING", "IN_PROGRESS"] },
        },
        include: {
          workflowStep: { select: { title: true } },
          lead: { include: { client: { select: { name: true } } } },
        },
        orderBy: { dueDate: "asc" },
        take: 5,
      }),
    ])

  return (
    <div className="flex-1 overflow-auto bg-[var(--color-surface)] p-6 lg:p-8" dir={params.locale === "he" ? "rtl" : "ltr"}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-[var(--color-text)]">
            {t("greeting", { name: firstName })} 👋
          </h1>
          <p className="text-sm text-[var(--color-muted-fg)] mt-1">
            {today.toLocaleDateString(dateLocale, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <Link
          href="/leads"
          className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
          style={{ background: "var(--color-highlight)" }}
        >
          {t("newLead")}
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: t("newLeadsToday"), value: newLeadsToday, color: "var(--color-highlight)" },
          { label: t("pendingTreatment"), value: totalPending, color: "#d97706" },
          { label: t("overdueFollowups"), value: overdueCount, color: "#dc2626" },
          { label: t("appointmentsThisMonth"), value: bookedThisMonth, color: "var(--color-text)" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-surface-raised rounded-2xl border border-border p-5 shadow-card">
            <p className="text-xs uppercase tracking-wide text-[var(--color-muted-fg)] mb-2">{label}</p>
            <p className="font-display text-4xl font-bold tabular-nums" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h2 className="font-semibold text-sm text-[var(--color-muted-fg)] uppercase tracking-wide mb-3">{t("recentLeads")}</h2>
          <div className="bg-surface-raised rounded-2xl border border-border overflow-hidden shadow-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-[var(--color-surface)]">
                  {[t("name"), t("treatment"), t("source"), t("status")].map((h) => (
                    <th key={h} className="text-right text-xs text-[var(--color-muted-fg)] font-medium px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentLeads.map((lead) => (
                  <tr key={lead.id} className="border-b border-border/50 last:border-0 hover:bg-[var(--color-surface)] transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/leads/${lead.id}`} className="font-semibold text-[var(--color-text)] hover:underline">
                        {lead.client.name}
                      </Link>
                      <p className="text-xs text-[var(--color-muted-fg)]">{lead.client.phone}</p>
                    </td>
                    <td className="px-4 py-3 text-[var(--color-muted-fg)]">{lead.client.treatmentWanted ?? "—"}</td>
                    <td className="px-4 py-3 text-[var(--color-muted-fg)]">{lead.client.source ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_CLASSES[lead.status] ?? ""}`}>
                        {tStatus(lead.status)}
                      </span>
                    </td>
                  </tr>
                ))}
                {recentLeads.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-[var(--color-muted-fg)] text-sm">
                      {t("noLeads")} — <Link href="/leads" className="underline">{t("addFirstLead")}</Link>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h2 className="font-semibold text-sm text-[var(--color-muted-fg)] uppercase tracking-wide mb-3">{t("urgentFollowups")}</h2>
          <div className="bg-surface-raised rounded-2xl border border-border shadow-card divide-y divide-border">
            {urgentTasks.map((task) => {
              const isOverdue = task.dueDate ? task.dueDate < today : false
              const clientName = task.lead?.client?.name ?? t("client" as never)
              return (
                <div key={task.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="font-semibold text-sm text-[var(--color-text)]">{clientName}</p>
                    <p className="text-xs text-[var(--color-muted-fg)]">{task.workflowStep?.title ?? "משימה"}</p>
                  </div>
                  <span className={`text-xs font-semibold ${isOverdue ? "text-red-500" : "text-[var(--color-highlight)]"}`}>
                    {task.dueDate
                      ? isOverdue ? t("overdue") : task.dueDate.toLocaleDateString(dateLocale, { day: "numeric", month: "short" })
                      : t("noDate")}
                  </span>
                </div>
              )
            })}
            {urgentTasks.length === 0 && (
              <div className="px-4 py-6 text-center text-sm text-[var(--color-muted-fg)]">
                {t("noUrgentTasks")}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
