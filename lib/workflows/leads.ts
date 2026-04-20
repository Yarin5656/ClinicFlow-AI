import { prisma } from "@/lib/db/prisma"

/**
 * Creates follow-up tasks for a newly created lead using the specified workflow.
 * One task per workflow step, keyed by (leadId, workflowStepId) — checked via findFirst.
 */
export async function generateFollowUpTasksForLead(
  userId: string,
  leadId: string,
  workflowSlug: string = "lead-intake"
): Promise<{ created: number }> {
  const workflow = await prisma.workflow.findUnique({
    where: { slug: workflowSlug },
    include: { steps: { orderBy: { order: "asc" } } },
  })

  if (!workflow || !workflow.isActive) return { created: 0 }

  let created = 0

  for (const step of workflow.steps) {
    const existing = await prisma.task.findFirst({
      where: { leadId, workflowStepId: step.id },
    })

    if (!existing) {
      await prisma.task.create({
        data: {
          userId,
          leadId,
          workflowStepId: step.id,
          status: "PENDING",
        },
      })
      created++
    }
  }

  return { created }
}
