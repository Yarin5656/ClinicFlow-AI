/**
 * Rescue script: re-runs the workflow engine for every user whose
 * MoveProfile exists but whose task list was wiped by a seed re-run.
 * Safe to run multiple times — the engine is idempotent.
 */
import { PrismaClient } from "@prisma/client"
import { generateTasksForUser } from "../lib/workflows/engine"
import type { WizardAnswers } from "../types"

const prisma = new PrismaClient()

async function main() {
  const orphans = await prisma.user.findMany({
    where: {
      household: { moveProfile: { isNot: null } },
      tasks: { none: {} },
    },
    include: {
      household: { include: { moveProfile: true } },
    },
  })

  console.log(`Found ${orphans.length} users with profile but no tasks`)

  for (const user of orphans) {
    const household = user.household
    const profile = household?.moveProfile
    if (!household || !profile) continue

    const answers = profile.answers as unknown as WizardAnswers
    const result = await generateTasksForUser(user.id, household.id, answers)
    console.log(
      `  ${user.email}: +${result.created} tasks, +${result.reminders} reminders`
    )
  }

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
