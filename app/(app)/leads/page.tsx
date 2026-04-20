import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth"
import { prisma } from "@/lib/db/prisma"
import Link from "next/link"

export const metadata = { title: "לידים — ClinicFlow AI" }

const STATUS_LABELS: Record<string, string> = {
  NEW: "חדש", FOLLOW_UP: "follow-up", QUOTED: "הצעת מחיר",
  BOOKED: "נקבע תור", WON: "נסגר", LOST: "לא מתקדם",
}
const STATUS_CLASSES: Record<string, string> = {
  NEW: "bg-blue-100 text-blue-700", FOLLOW_UP: "bg-amber-100 text-amber-800",
  QUOTED: "bg-purple-100 text-purple-800", BOOKED: "bg-green-100 text-green-800",
  WON: "bg-emerald-100 text-emerald-800", LOST: "bg-red-100 text-red-800",
}

export default async function LeadsPage() {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId) redirect("/login")

  const leads = await prisma.lead.findMany({
    where: { client: { userId } },
    include: {
      client: { select: { name: true, phone: true, source: true, treatmentWanted: true } },
      tasks: { where: { status: { in: ["PENDING", "IN_PROGRESS"] } }, select: { id: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="flex-1 overflow-auto bg-[var(--color-surface)] p-6 lg:p-8" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-[var(--color-text)]">לידים</h1>
      </div>

      <div className="bg-surface-raised rounded-2xl border border-border overflow-hidden shadow-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-[var(--color-surface)]">
              {["שם לקוח", "טלפון", "טיפול", "מקור", "סטטוס", "משימות פתוחות", "נכנס"].map((h) => (
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
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_CLASSES[lead.status] ?? ""}`}>
                    {STATUS_LABELS[lead.status] ?? lead.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-center text-[var(--color-muted-fg)]">{lead.tasks.length}</td>
                <td className="px-4 py-3 text-xs text-[var(--color-muted-fg)]">
                  {lead.createdAt.toLocaleDateString("he-IL")}
                </td>
              </tr>
            ))}
            {leads.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-[var(--color-muted-fg)]">
                  אין לידים עדיין
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
