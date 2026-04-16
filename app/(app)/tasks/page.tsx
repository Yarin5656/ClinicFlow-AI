import Link from "next/link"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth"
import { prisma } from "@/lib/db/prisma"
import { Header } from "@/components/layout/Header"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { Card } from "@/components/ui/Card"
import type { TaskStatus } from "@/types"

export const metadata = { title: "משימות — MoveEasy Israel" }

interface Props {
  searchParams: { workflow?: string }
}

export default async function TasksPage({ searchParams }: Props) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId) redirect("/login")

  const workflowSlug = searchParams.workflow

  const tasks = await prisma.task.findMany({
    where: {
      userId,
      ...(workflowSlug ? { workflowStep: { workflow: { slug: workflowSlug } } } : {}),
    },
    include: {
      workflowStep: {
        include: {
          workflow: { select: { slug: true, title: true } },
        },
      },
    },
    orderBy: [
      { workflowStep: { workflow: { order: "asc" } } },
      { workflowStep: { order: "asc" } },
    ],
  })

  // Group by status, then preserve order within each group
  const statusOrder: TaskStatus[] = ["IN_PROGRESS", "PENDING", "DONE", "SKIPPED"]
  const grouped = new Map<TaskStatus, typeof tasks>()
  for (const status of statusOrder) grouped.set(status, [])
  for (const t of tasks) grouped.get(t.status as TaskStatus)?.push(t)

  const statusLabels: Record<TaskStatus, string> = {
    IN_PROGRESS: "בתהליך",
    PENDING: "ממתינות",
    DONE: "הושלמו",
    SKIPPED: "דולגו",
  }

  const workflowTitle = tasks[0]?.workflowStep.workflow.title ?? "כל המשימות"
  const pageTitle = workflowSlug ? workflowTitle : "כל המשימות"
  const subtitle = workflowSlug
    ? `${tasks.length} משימות בתהליך זה`
    : `סה"כ ${tasks.length} משימות`

  return (
    <>
      <Header title={pageTitle} subtitle={subtitle} />
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-3xl mx-auto flex flex-col gap-6">
          <div>
            <Link
              href="/dashboard"
              className="text-sm text-accent hover:underline underline-offset-2"
            >
              ← חזרה ללוח הבקרה
            </Link>
          </div>

          {tasks.length === 0 ? (
            <p className="text-muted-foreground">לא נמצאו משימות.</p>
          ) : (
            statusOrder.map((status) => {
              const group = grouped.get(status)!
              if (group.length === 0) return null
              return (
                <section key={status} className="flex flex-col gap-2">
                  <h2 className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">
                    {statusLabels[status]} ({group.length})
                  </h2>
                  <div className="flex flex-col gap-2">
                    {group.map((task) => (
                      <Link
                        key={task.id}
                        href={`/tasks/${task.id}`}
                        className="group"
                      >
                        <Card hoverable padding="md" className="flex items-center gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-[var(--color-text)] mb-0.5 group-hover:text-primary transition-colors">
                              {task.workflowStep.title}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {task.workflowStep.workflow.title}
                            </div>
                          </div>
                          <StatusBadge status={task.status as TaskStatus} />
                          <span className="text-muted-foreground text-lg" aria-hidden>←</span>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </section>
              )
            })
          )}
        </div>
      </div>
    </>
  )
}
