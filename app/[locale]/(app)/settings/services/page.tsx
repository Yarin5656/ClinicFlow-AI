import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth"
import { prisma } from "@/lib/db/prisma"
import { Link } from "@/lib/i18n/navigation"
import { ServiceToggle } from "@/components/settings/ServiceToggle"

export default async function ServicesPage({ params }: { params: { locale: string } }) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId) redirect(`/${params.locale}/login`)

  const services = await prisma.service.findMany({
    where: { userId },
    include: { category: { select: { name: true } } },
    orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
  })

  return (
    <div className="p-6 lg:p-8 max-w-3xl" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-[var(--color-text)]">שירותים</h1>
        <Link href="/settings/services/new" className="px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: "var(--color-highlight)" }}>
          + הוסף שירות
        </Link>
      </div>

      {services.length === 0 ? (
        <div className="bg-surface-raised rounded-2xl border border-border p-10 text-center text-[var(--color-muted-fg)]">
          <p className="text-sm">עדיין לא הוספת שירותים.</p>
          <Link href="/settings/services/new" className="text-sm underline mt-2 inline-block" style={{ color: "var(--color-highlight)" }}>הוסף את הראשון</Link>
        </div>
      ) : (
        <div className="bg-surface-raised rounded-2xl border border-border divide-y divide-border">
          {services.map(s => (
            <div key={s.id} className="flex items-center justify-between px-4 py-3 gap-4">
              <div className="min-w-0">
                <p className="font-semibold text-sm text-[var(--color-text)] truncate">{s.name}</p>
                {s.category && <p className="text-xs text-[var(--color-muted-fg)]">{s.category.name}</p>}
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <ServiceToggle id={s.id} isActive={s.isActive} />
                <Link href={`/settings/services/${s.id}`} className="text-xs text-[var(--color-muted-fg)] hover:underline">ערוך</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
