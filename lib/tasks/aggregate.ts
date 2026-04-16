import { prisma } from "@/lib/db/prisma"
import type { WorkflowCardData } from "@/components/tasks/WorkflowCard"

/** Aggregate all tasks for a user, grouped by workflow, with per-group progress. */
export async function getUserWorkflowsWithProgress(userId: string): Promise<WorkflowCardData[]> {
  const tasks = await prisma.task.findMany({
    where: { userId },
    include: {
      workflowStep: {
        include: {
          workflow: {
            select: { id: true, slug: true, title: true, description: true, order: true },
          },
        },
      },
    },
  })

  // Group by workflow slug
  const byWorkflow = new Map<string, WorkflowCardData & { order: number; firstPendingOrder: number }>()

  for (const task of tasks) {
    const wf = task.workflowStep.workflow
    if (!byWorkflow.has(wf.slug)) {
      byWorkflow.set(wf.slug, {
        slug: wf.slug,
        title: wf.title,
        description: wf.description,
        totalTasks: 0,
        completedTasks: 0,
        inProgressTasks: 0,
        pendingTasks: 0,
        nextTaskTitle: null,
        order: wf.order,
        firstPendingOrder: Number.MAX_SAFE_INTEGER,
      })
    }

    const entry = byWorkflow.get(wf.slug)!
    entry.totalTasks += 1

    if (task.status === "DONE") entry.completedTasks += 1
    else if (task.status === "IN_PROGRESS") entry.inProgressTasks += 1
    else if (task.status === "PENDING") entry.pendingTasks += 1

    // First pending/in-progress task (by step order) becomes the "next task" hint
    if (task.status !== "DONE" && task.status !== "SKIPPED") {
      if (task.workflowStep.order < entry.firstPendingOrder) {
        entry.firstPendingOrder = task.workflowStep.order
        entry.nextTaskTitle = task.workflowStep.title
      }
    }
  }

  return Array.from(byWorkflow.values())
    .sort((a, b) => a.order - b.order)
    .map(({ order: _o, firstPendingOrder: _fp, ...card }) => card)
}

export interface OverallProgress {
  total: number
  completed: number
  inProgress: number
  pending: number
  percentage: number
}

export function calculateOverallProgress(cards: WorkflowCardData[]): OverallProgress {
  const total = cards.reduce((sum, c) => sum + c.totalTasks, 0)
  const completed = cards.reduce((sum, c) => sum + c.completedTasks, 0)
  const inProgress = cards.reduce((sum, c) => sum + c.inProgressTasks, 0)
  const pending = cards.reduce((sum, c) => sum + c.pendingTasks, 0)
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0
  return { total, completed, inProgress, pending, percentage }
}
