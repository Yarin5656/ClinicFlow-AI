import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth"
import { prisma } from "@/lib/db/prisma"
import { StaffLocationsManager } from "@/components/settings/StaffLocationsManager"

export default async function LocationsPage({ params }: { params: { locale: string } }) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId) redirect(`/${params.locale}/login`)
  const locations = await prisma.location.findMany({ where: { userId }, orderBy: { createdAt: "asc" } })

  return (
    <div className="p-6 lg:p-8 max-w-xl" dir="rtl">
      <h1 className="font-display text-2xl font-bold text-[var(--color-text)] mb-6">סניפים</h1>
      <StaffLocationsManager
        items={locations}
        endpoint="/api/locations"
        nameLabel="שם סניף"
        secondaryLabel="כתובת"
        secondaryKey="address"
      />
    </div>
  )
}
