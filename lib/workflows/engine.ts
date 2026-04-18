import { prisma } from "@/lib/db/prisma"
import type { WizardAnswers, WorkflowStepDefinition } from "@/types"

/**
 * Evaluates conditions against wizard answers using AND logic.
 * Empty or missing conditions = always passes.
 *
 * Returns false if a referenced key is missing from answers —
 * this prevents accidentally matching undefined values.
 */
export function matchesConditions(
  conditions: Record<string, unknown> | undefined,
  answers: WizardAnswers
): boolean {
  if (!conditions || Object.keys(conditions).length === 0) return true

  return Object.entries(conditions).every(([key, expected]) => {
    if (!(key in answers)) return false
    const actual = (answers as unknown as Record<string, unknown>)[key]
    return actual === expected
  })
}

/** Return only steps whose triggerConditions match the user's answers (ordered by step.order). */
export function filterApplicableSteps(
  steps: WorkflowStepDefinition[],
  answers: WizardAnswers
): WorkflowStepDefinition[] {
  return steps
    .filter((step) => matchesConditions(step.triggerConditions, answers))
    .sort((a, b) => a.order - b.order)
}

/**
 * Generate user tasks from the DB-persisted workflow definitions.
 *
 * 1. Load all active workflows from DB (seeded from JSON).
 * 2. Skip workflow if workflow-level triggerConditions fail.
 * 3. For each workflow, skip steps whose step-level triggerConditions fail.
 * 4. Upsert one Task per (userId, workflowStepId) — the @@unique constraint
 *    makes re-runs idempotent and preserves existing task status.
 * 5. For each task with a deadline, create one automatic Reminder scheduled
 *    one week before the deadline (or immediately if deadline already passed).
 */
export async function generateTasksForUser(
  userId: string,
  householdId: string,
  answers: WizardAnswers
): Promise<{ created: number; kept: number; reminders: number }> {
  const workflows = await prisma.workflow.findMany({
    where: { isActive: true },
    include: { steps: { orderBy: { order: "asc" } } },
    orderBy: { order: "asc" },
  })

  const moveDate = answers.moveDate ? new Date(answers.moveDate) : null

  let created = 0
  let kept = 0
  let reminders = 0

  for (const workflow of workflows) {
    const workflowConditions = (workflow.triggerConditions ?? {}) as Record<string, unknown>
    if (!matchesConditions(workflowConditions, answers)) continue

    for (const step of workflow.steps) {
      const stepConditions = (step.triggerConditions ?? {}) as Record<string, unknown>
      if (!matchesConditions(stepConditions, answers)) continue

      const existing = await prisma.task.findUnique({
        where: { userId_workflowStepId: { userId, workflowStepId: step.id } },
      })

      let task = existing
      if (existing) {
        kept += 1
      } else {
        task = await prisma.task.create({
          data: {
            userId,
            householdId,
            workflowStepId: step.id,
            status: "PENDING",
          },
        })
        created += 1
      }

      // Auto-reminder: 7 days before the regulatory deadline.
      if (step.deadlineDaysAfterMove != null && moveDate && task) {
        const deadline = new Date(moveDate)
        deadline.setDate(deadline.getDate() + step.deadlineDaysAfterMove)
        const remindAt = new Date(deadline)
        remindAt.setDate(remindAt.getDate() - 7)

        const already = await prisma.reminder.findFirst({
          where: { userId, taskId: task.id, isAutomatic: true },
          select: { id: true },
        })

        if (!already) {
          await prisma.reminder.create({
            data: {
              userId,
              taskId: task.id,
              message: `דדליין ל${step.title.replace(/^\s*/, "")} — עוד 7 ימים`,
              scheduledAt: remindAt,
              isAutomatic: true,
            },
          })
          reminders += 1
        }
      }
    }
  }

  return { created, kept, reminders }
}
