import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth"
import { prisma } from "@/lib/db/prisma"
import { Header } from "@/components/layout/Header"

export const metadata = { title: "לוח הבקרה — MoveEasy Israel" }

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId) redirect("/login")

  // Gate: user must complete onboarding first
  const household = await prisma.household.findUnique({
    where: { userId },
    include: { moveProfile: { select: { id: true } } },
  })
  if (!household?.moveProfile) redirect("/onboarding")

  // Count tasks by workflow (Phase 5 will render workflow cards with progress)
  const tasksByWorkflow = await prisma.task.groupBy({
    by: ["workflowStepId"],
    where: { userId },
    _count: true,
  })

  return (
    <>
      <Header
        title="לוח הבקרה"
        subtitle={`מעבר ל${household.toAddress ?? "כתובת חדשה"} — ${household.moveDate ? new Date(household.moveDate).toLocaleDateString("he-IL") : ""}`}
      />
      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-muted-foreground">
            נוצרו {tasksByWorkflow.length} משימות אישיות עבורך. בשלב 5 נציג כאן כרטיסי תהליך עם progress.
          </p>
        </div>
      </div>
    </>
  )
}
