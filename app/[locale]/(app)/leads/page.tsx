import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth"
import { prisma } from "@/lib/db/prisma"
import { Link } from "@/lib/i18n/navigation"
import { getTranslations } from "next-intl/server"
import { NewLeadModal } from "@/components/leads/NewLeadModal"
import { LeadStatusBadge } from "@/components/leads/LeadStatusBadge"

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: "leads" })
  return { title: `${t("title")} — ClinicFlow AI` }
}

export default async function LeadsPage({ params }: { params: { locale: string } }) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId) redirect(`/${params.locale}/login`)

  const t = await getTranslations({ locale: params.locale, namespace: "leads" })
  const dateLocale = params.locale === "he" ? "he-IL" : params.locale === "ru" ? "ru-RU" : "en-US"

  const leads = await prisma.lead.findMany({
    where: { client: { userId } },
    include: {
      client: { select: { name: true, phone: true, source: true, treatmentWanted: true } },
      tasks: { where: { status: { in: ["PENDING", "IN_PROGRESS"] } }, select: { id: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="flex-1 overflow-auto bg-[var(--color-surface)] p-6 lg:p-8" dir={params.locale === "he" ? "rtl" : "ltr"}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-[var(--color-text)]">{t("title")}</h1>
        <NewLeadModal locale={params.locale} />
      </div>

      <div className="bg-surface-raised rounded-2xl border border-border shadow-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-[var(--color-surface)]">
              {[t("clientName"), t("phone"), t("treatment"), t("source"), t("status"), t("openTasks"), t("entered")].map((h) => (
                <th key={h} className="text-right text-xs text-[var(--color-muted-fg)] font-medium px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id} className="border-b border-border/50 last:border-0 hover:bg-[var(--color-surface)] transition-colors">
                <td className="px-4 py-3">
                  <Link href={`/leads/${lead.id}`} className="font-semibold text-[var(--color-text)] hover:underline">
                    {lead.client.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-[var(--color-muted-fg)]">{lead.client.phone}</td>
                <td className="px-4 py-3 text-[var(--color-muted-fg)]">{lead.client.treatmentWanted ?? "—"}</td>
                <td className="px-4 py-3 text-[var(--color-muted-fg)]">{lead.client.source ?? "—"}</td>
                <td className="px-4 py-3">
                  <LeadStatusBadge leadId={lead.id} status={lead.status as any} />
                </td>
                <td className="px-4 py-3 text-center text-[var(--color-muted-fg)]">{lead.tasks.length}</td>
                <td className="px-4 py-3 text-xs text-[var(--color-muted-fg)]">
                  {lead.createdAt.toLocaleDateString(dateLocale)}
                </td>
              </tr>
            ))}
            {leads.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-[var(--color-muted-fg)]">
                  {t("noLeads")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
