import Link from "next/link"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth"
import { prisma } from "@/lib/db/prisma"
import { PageHero } from "@/components/layout/PageHero"
import { StatusStamp } from "@/components/ui/StatusStamp"
import { cn } from "@/lib/utils"
import type { TaskStatus } from "@/types"

export const metadata = { title: "משימות — MoveEasy Israel" }

interface Props {
  searchParams: { workflow?: string }
}

const WORKFLOW_META: Record<string, { icon: string; eyebrow: string }> = {
  "address-change": { icon: "🏛️", eyebrow: "משרד הפנים · כתובת רשמית" },
  arnona:           { icon: "🏙️", eyebrow: "עירייה · ארנונה" },
  "tax-authority":  { icon: "💰", eyebrow: "רשות המסים" },
}

const STATUS_LABEL: Record<TaskStatus, string> = {
  IN_PROGRESS: "בטיפול עכשיו",
  PENDING:     "ממתינות",
  DONE:        "הושלמו",
  SKIPPED:     "דולגו",
}

export default async function TasksPage({ searchParams }: Props) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId) redirect("/login")

  const workflowSlug = searchParams.workflow

  const tasks = await prisma.task.findMany({
    where: {
      userId,
      ...(workflowSlug
        ? { workflowStep: { workflow: { slug: workflowSlug } } }
        : {}),
    },
    include: {
      workflowStep: {
        include: { workflow: { select: { slug: true, title: true } } },
      },
      _count: { select: { documents: true } },
    },
    orderBy: [
      { workflowStep: { workflow: { order: "asc" } } },
      { workflowStep: { order: "asc" } },
    ],
  })

  const statusOrder: TaskStatus[] = ["IN_PROGRESS", "PENDING", "DONE", "SKIPPED"]
  const grouped = new Map<TaskStatus, typeof tasks>()
  for (const s of statusOrder) grouped.set(s, [])
  for (const t of tasks) grouped.get(t.status as TaskStatus)?.push(t)

  const workflowTitle = tasks[0]?.workflowStep.workflow.title ?? "כל המשימות"
  const meta = workflowSlug ? WORKFLOW_META[workflowSlug] : null
  const doneCount = tasks.filter((t) => t.status === "DONE").length

  return (
    <div
      className="flex-1 overflow-auto"
      style={
        workflowSlug
          ? { viewTransitionName: `workflow-${workflowSlug}` }
          : undefined
      }
    >
      <PageHero
        eyebrow={meta?.eyebrow ?? "כל המשימות"}
        title={
          <span className="inline-flex items-center gap-3">
            {meta && <span aria-hidden className="text-4xl">{meta.icon}</span>}
            {workflowSlug ? workflowTitle : "כל המשימות"}
          </span>
        }
        subtitle={
          <span>
            {tasks.length} {tasks.length === 1 ? "משימה" : "משימות"}
            {doneCount > 0 && ` · ${doneCount} הושלמו`}
          </span>
        }
        right={
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm text-white/80 hover:text-white transition-colors"
          >
            <span aria-hidden>←</span> חזרה ללוח הבקרה
          </Link>
        }
      />

      <div className="max-w-3xl mx-auto px-6 lg:px-8 py-8 lg:py-10 flex flex-col gap-8">
        {tasks.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            אין משימות בקטגוריה זו.
          </div>
        ) : (
          statusOrder.map((status) => {
            const group = grouped.get(status)!
            if (group.length === 0) return null
            return (
              <section key={status} className="flex flex-col gap-3">
                <header className="flex items-baseline gap-3">
                  <h2 className="text-xs uppercase tracking-[0.18em] font-bold text-muted-foreground">
                    {STATUS_LABEL[status]}
                  </h2>
                  <span className="text-xs text-muted-foreground/70">
                    ({group.length})
                  </span>
                </header>
                <div className="flex flex-col gap-2.5">
                  {group.map((task, idx) => (
                    <TaskRow
                      key={task.id}
                      taskId={task.id}
                      status={task.status as TaskStatus}
                      title={task.workflowStep.title}
                      workflowTitle={task.workflowStep.workflow.title}
                      order={task.workflowStep.order}
                      docCount={task._count.documents}
                      index={idx}
                    />
                  ))}
                </div>
              </section>
            )
          })
        )}
      </div>
    </div>
  )
}

function TaskRow({
  taskId,
  status,
  title,
  workflowTitle,
  order,
  docCount,
}: {
  taskId: string
  status: TaskStatus
  title: string
  workflowTitle: string
  order: number
  docCount: number
  index: number
}) {
  const isDone = status === "DONE"
  return (
    <Link
      href={`/tasks/${taskId}`}
      className={cn(
        "group relative flex items-center gap-4 bg-surface-raised rounded-xl border border-border",
        "p-4 pr-5 shadow-card hover:shadow-card-hover hover:border-[var(--color-highlight)]/50",
        "transition-all duration-150"
      )}
      style={{ viewTransitionName: `task-${taskId}` }}
    >
      {/* Step number badge */}
      <div
        className={cn(
          "flex items-center justify-center w-10 h-10 rounded-lg shrink-0 font-display font-bold tabular-nums text-sm",
          isDone
            ? "bg-[var(--color-highlight)] text-[var(--color-highlight-fg)]"
            : "bg-[var(--color-muted)] text-[var(--color-muted-fg)]"
        )}
        aria-hidden
      >
        {isDone ? "✓" : String(order).padStart(2, "0")}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div
          className={cn(
            "text-sm font-semibold leading-tight mb-0.5 group-hover:text-[var(--color-highlight)] transition-colors",
            isDone
              ? "text-muted-foreground line-through"
              : "text-[var(--color-text)]"
          )}
        >
          {title}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
          <span>{workflowTitle}</span>
          {docCount > 0 && (
            <>
              <span aria-hidden>·</span>
              <span className="inline-flex items-center gap-1">
                <span aria-hidden>◫</span>
                {docCount} {docCount === 1 ? "מסמך" : "מסמכים"}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Status stamp only when done; others show chevron */}
      {isDone ? (
        <StatusStamp status={status} size="sm" rotate={-6} />
      ) : (
        <span
          className="text-muted-foreground text-lg shrink-0 transition-transform group-hover:-translate-x-0.5"
          aria-hidden
        >
          ←
        </span>
      )}
    </Link>
  )
}
