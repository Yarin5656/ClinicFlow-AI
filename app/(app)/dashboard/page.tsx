import Link from "next/link"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth"
import { prisma } from "@/lib/db/prisma"
import { PageHero, Underline } from "@/components/layout/PageHero"
import { WorkflowCard } from "@/components/tasks/WorkflowCard"
import { MoveTimeline } from "@/components/tasks/MoveTimeline"
import {
  getUserWorkflowsWithProgress,
  calculateOverallProgress,
} from "@/lib/tasks/aggregate"

export const metadata = { title: "לוח הבקרה — MoveEasy Israel" }

const WORKFLOW_ICONS: Record<string, string> = {
  "address-change": "🏛️",
  arnona:           "🏙️",
  "tax-authority":  "💰",
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId) redirect("/login")

  const household = await prisma.household.findUnique({
    where: { userId },
    include: { moveProfile: { select: { id: true } } },
  })
  if (!household?.moveProfile) redirect("/onboarding")

  const cards = await getUserWorkflowsWithProgress(userId)
  const progress = calculateOverallProgress(cards)
  const firstName = (session?.user?.name ?? "").split(" ")[0] || "לכם"

  const daysUntilMove = household.moveDate
    ? Math.max(
        0,
        Math.ceil(
          (household.moveDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        )
      )
    : 0

  const moveDateLabel = household.moveDate
    ? household.moveDate.toLocaleDateString("he-IL", { day: "numeric", month: "short" })
    : ""

  return (
    <div className="flex-1 overflow-auto">
      <PageHero
        eyebrow="לוח בקרה · המסע שלך"
        title={
          <>
            <span className="block">שלום, {firstName}.</span>
            <span className="block mt-1">
              <Underline>{progress.percentage}%</Underline> מהמעבר מאחוריך.
            </span>
          </>
        }
        subtitle={
          household.toAddress && household.moveDate ? (
            <span className="inline-flex items-center flex-wrap gap-x-3 gap-y-1">
              <span className="inline-flex items-center gap-1.5">
                <span
                  aria-hidden
                  className="inline-block w-2 h-2 rounded-full bg-[var(--color-highlight)]"
                />
                {household.toAddress} · {moveDateLabel}
              </span>
              <span className="opacity-60">·</span>
              <span>
                {daysUntilMove > 0
                  ? `${daysUntilMove} ימים עד המעבר`
                  : daysUntilMove === 0
                    ? "היום העובר!"
                    : "המעבר מאחוריך"}
              </span>
            </span>
          ) : null
        }
        right={
          daysUntilMove > 0 ? (
            <div className="flex flex-col items-center gap-1 pt-2">
              <MoveTimeline
                daysUntilMove={daysUntilMove}
                moveDateLabel={moveDateLabel}
              />
            </div>
          ) : undefined
        }
      />

      <div className="max-w-5xl mx-auto px-6 lg:px-8 py-8 lg:py-10 flex flex-col gap-10">
        {/* Status row: 3 counter tiles */}
        <section className="grid grid-cols-3 gap-4">
          <Tile label="הושלמו"   value={progress.completed}   highlight />
          <Tile label="בתהליך"   value={progress.inProgress}  tone="warning" />
          <Tile label="ממתינות" value={progress.pending}      tone="muted" />
        </section>

        {/* Workflows grid */}
        <section>
          <div className="flex items-baseline justify-between mb-5">
            <h2 className="font-display text-2xl font-bold text-[var(--color-text)] tracking-tight">
              התהליכים שלך
            </h2>
            <Link
              href="/tasks"
              className="text-sm text-[var(--color-highlight)] hover:underline underline-offset-2 font-medium"
            >
              כל המשימות ←
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {cards.map((card, i) => (
              <WorkflowCard
                key={card.slug}
                data={card}
                icon={WORKFLOW_ICONS[card.slug] ?? "📋"}
                delay={0.1 + i * 0.08}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

function Tile({
  label,
  value,
  highlight,
  tone,
}: {
  label: string
  value: number
  highlight?: boolean
  tone?: "warning" | "muted"
}) {
  const color = highlight
    ? "var(--color-highlight)"
    : tone === "warning"
      ? "var(--color-warning)"
      : "var(--color-muted-fg)"
  return (
    <div className="bg-surface-raised rounded-2xl border border-border p-5 shadow-card">
      <div className="flex items-baseline justify-between gap-2">
        <span
          className="font-display text-4xl font-bold tabular-nums"
          style={{ color }}
        >
          {value}
        </span>
        <span className="text-sm text-muted-foreground text-right">{label}</span>
      </div>
    </div>
  )
}
