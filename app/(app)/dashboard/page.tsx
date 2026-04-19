import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth"
import { prisma } from "@/lib/db/prisma"
import { Header } from "@/components/layout/Header"
import { WorkflowCard } from "@/components/tasks/WorkflowCard"
import { OverallProgressBanner } from "@/components/tasks/OverallProgressBanner"
import {
  getUserWorkflowsWithProgress,
  calculateOverallProgress,
} from "@/lib/tasks/aggregate"

export const metadata = { title: "לוח הבקרה — MoveEasy Israel" }

// Per-workflow visual styling (icon + accent color)
const WORKFLOW_STYLE: Record<
  string,
  { icon: string; accentColor: "navy" | "teal" | "amber" | "green" }
> = {
  "address-change": { icon: "🏛️", accentColor: "navy" },
  arnona:           { icon: "🏙️", accentColor: "teal" },
  "tax-authority":  { icon: "💰", accentColor: "amber" },
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId) redirect("/login")

  // Gate: must have completed onboarding
  const household = await prisma.household.findUnique({
    where: { userId },
    include: { moveProfile: { select: { id: true } } },
  })
  if (!household?.moveProfile) redirect("/onboarding")

  const cards = await getUserWorkflowsWithProgress(userId)
  const progress = calculateOverallProgress(cards)
  const userName = session?.user?.name ?? session?.user?.email?.split("@")[0] ?? ""

  const nextMilestone =
    progress.completed === 0
      ? "בוא נתחיל — לחץ על התהליך הראשון"
      : progress.completed === progress.total
      ? "כל הכבוד — סיימת!"
      : `עוד ${progress.total - progress.completed} משימות עד לסיום`

  return (
    <>
      <Header
        title={`שלום${userName ? `, ${userName}` : ""}`}
        subtitle={nextMilestone}
      />
      <div className="flex-1 p-6 lg:p-8 overflow-auto">
        <div className="max-w-5xl mx-auto flex flex-col gap-8">
          <OverallProgressBanner
            progress={progress}
            targetCity={household.toAddress}
            moveDate={household.moveDate}
          />

          <div>
            <div className="flex items-baseline justify-between mb-5">
              <h2 className="font-display text-2xl font-semibold text-[var(--color-text)] tracking-tight">
                התהליכים שלך
              </h2>
              <span className="text-sm text-muted-foreground">
                {cards.length} {cards.length === 1 ? "תהליך" : "תהליכים"}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {cards.map((card, i) => {
                const style =
                  WORKFLOW_STYLE[card.slug] ?? {
                    icon: "📋",
                    accentColor: "navy" as const,
                  }
                return (
                  <WorkflowCard
                    key={card.slug}
                    data={card}
                    icon={style.icon}
                    accentColor={style.accentColor}
                    delay={0.1 + i * 0.08}
                  />
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
