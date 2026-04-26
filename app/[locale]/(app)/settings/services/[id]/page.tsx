import { redirect, notFound } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth"
import { prisma } from "@/lib/db/prisma"
import { ServiceForm } from "@/components/settings/ServiceForm"

export default async function ServiceEditPage({
  params,
}: { params: { locale: string; id: string } }) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId) redirect(`/${params.locale}/login`)

  const isNew = params.id === "new"
  const [staff, locations, categories, existing] = await Promise.all([
    prisma.staffMember.findMany({ where: { userId, isActive: true }, orderBy: { createdAt: "asc" } }),
    prisma.location.findMany({ where: { userId, isActive: true }, orderBy: { createdAt: "asc" } }),
    prisma.serviceCategory.findMany({ where: { userId }, orderBy: { displayOrder: "asc" } }),
    isNew ? null : prisma.service.findFirst({ where: { id: params.id, userId } }),
  ])

  if (!isNew && !existing) notFound()

  const initial = existing ? {
    id: existing.id,
    name: existing.name,
    description: existing.description ?? "",
    categoryId: existing.categoryId ?? "",
    priceType: existing.priceType as "exact" | "from" | "hidden",
    priceValue: existing.priceValue != null ? String(existing.priceValue / 100) : "",
    durationMin: existing.durationMin != null ? String(existing.durationMin) : "",
    isActive: existing.isActive,
    isBookable: existing.isBookable,
    staffId: existing.staffId ?? "",
    locationId: existing.locationId ?? "",
    displayOrder: String(existing.displayOrder),
  } : undefined

  return (
    <div className="p-6 lg:p-8" dir="rtl">
      <h1 className="font-display text-2xl font-bold text-[var(--color-text)] mb-6">
        {isNew ? "שירות חדש" : "עריכת שירות"}
      </h1>
      <ServiceForm
        initial={initial}
        staff={staff}
        locations={locations}
        categories={categories}
        locale={params.locale}
      />
    </div>
  )
}
