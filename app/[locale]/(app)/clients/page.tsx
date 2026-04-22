import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth"
import { prisma } from "@/lib/db/prisma"
import { Link } from "@/lib/i18n/navigation"
import { getTranslations } from "next-intl/server"

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: "clients" })
  return { title: `${t("title")} — ClinicFlow AI` }
}

export default async function ClientsPage({ params }: { params: { locale: string } }) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId) redirect(`/${params.locale}/login`)

  const t = await getTranslations({ locale: params.locale, namespace: "clients" })
  const dateLocale = params.locale === "he" ? "he-IL" : params.locale === "ru" ? "ru-RU" : "en-US"

  const clients = await prisma.client.findMany({
    where: { userId },
    include: {
      _count: { select: { leads: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="flex-1 overflow-auto bg-[var(--color-surface)] p-6 lg:p-8" dir={params.locale === "he" ? "rtl" : "ltr"}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-[var(--color-text)]">{t("title")}</h1>
      </div>

      <div className="bg-surface-raised rounded-2xl border border-border overflow-hidden shadow-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-[var(--color-surface)]">
              {[t("name"), t("phone"), t("treatment"), t("source"), t("leads"), t("joined")].map((h) => (
                <th key={h} className="text-right text-xs text-[var(--color-muted-fg)] font-medium px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr key={client.id} className="border-b border-border/50 last:border-0 hover:bg-[var(--color-surface)] transition-colors">
                <td className="px-4 py-3 font-semibold text-[var(--color-text)]">{client.name}</td>
                <td className="px-4 py-3 text-[var(--color-muted-fg)]">{client.phone}</td>
                <td className="px-4 py-3 text-[var(--color-muted-fg)]">{client.treatmentWanted ?? "—"}</td>
                <td className="px-4 py-3 text-[var(--color-muted-fg)]">{client.source ?? "—"}</td>
                <td className="px-4 py-3 text-center text-[var(--color-muted-fg)]">{client._count.leads}</td>
                <td className="px-4 py-3 text-xs text-[var(--color-muted-fg)]">{client.createdAt.toLocaleDateString(dateLocale)}</td>
              </tr>
            ))}
            {clients.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-[var(--color-muted-fg)]">
                  {t("noClients")} <Link href="/leads" className="underline">{t("addFirstLead")}</Link>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
