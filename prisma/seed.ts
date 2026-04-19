import { PrismaClient, Prisma } from "@prisma/client"
import { hash } from "bcryptjs"
import path from "path"
import fs from "fs/promises"
import type { WorkflowDefinition } from "../types"

// Typed objects need to be widened to Prisma's JSON input type.
const asJson = (value: unknown): Prisma.InputJsonValue =>
  value as Prisma.InputJsonValue

const prisma = new PrismaClient()

async function seedAdminUser() {
  const adminEmail = "admin@moveeasy.local"
  const existing = await prisma.user.findUnique({ where: { email: adminEmail } })

  if (existing) {
    console.log(`ℹ️  Admin user already exists: ${adminEmail}`)
    return
  }

  await prisma.user.create({
    data: {
      email: adminEmail,
      name: "Admin",
      passwordHash: await hash("admin1234", 10),
      isAdmin: true,
    },
  })
  console.log(`✅ Created admin user: ${adminEmail} / admin1234`)
}

async function loadWorkflowDefinitions(): Promise<WorkflowDefinition[]> {
  const workflowsDir = path.join(process.cwd(), "workflows")
  const entries = await fs.readdir(workflowsDir)
  const jsonFiles = entries.filter((f) => f.endsWith(".json"))

  const defs: WorkflowDefinition[] = []
  for (const filename of jsonFiles) {
    const fullPath = path.join(workflowsDir, filename)
    const contents = await fs.readFile(fullPath, "utf-8")
    defs.push(JSON.parse(contents) as WorkflowDefinition)
  }
  return defs.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
}

async function seedWorkflows() {
  const defs = await loadWorkflowDefinitions()
  console.log(`📂 Found ${defs.length} workflow definitions`)

  for (const def of defs) {
    // Upsert workflow (idempotent by slug)
    const workflow = await prisma.workflow.upsert({
      where: { slug: def.slug },
      create: {
        slug: def.slug,
        title: def.title,
        description: def.description,
        order: def.order ?? 0,
        triggerConditions: asJson(def.triggerConditions ?? {}),
        isActive: true,
      },
      update: {
        title: def.title,
        description: def.description,
        order: def.order ?? 0,
        triggerConditions: asJson(def.triggerConditions ?? {}),
      },
    })

    // Upsert steps by (workflowId, order) — stable across seed runs, so
    // user Tasks that reference workflowStepId keep working.
    const keptOrders = new Set<number>()
    for (const step of def.steps) {
      keptOrders.add(step.order)
      await prisma.workflowStep.upsert({
        where: { workflowId_order: { workflowId: workflow.id, order: step.order } },
        create: {
          workflowId: workflow.id,
          order: step.order,
          title: step.title,
          description: step.description,
          triggerConditions: asJson(step.triggerConditions ?? {}),
          deadlineDaysAfterMove: step.deadlineDaysAfterMove ?? null,
          requiredDocuments: asJson(step.requiredDocuments ?? []),
          externalLinks: asJson(step.externalLinks ?? []),
          helperNotes: step.helperNotes ?? null,
          completionRules: asJson(step.completionRules ?? {}),
        },
        update: {
          title: step.title,
          description: step.description,
          triggerConditions: asJson(step.triggerConditions ?? {}),
          deadlineDaysAfterMove: step.deadlineDaysAfterMove ?? null,
          requiredDocuments: asJson(step.requiredDocuments ?? []),
          externalLinks: asJson(step.externalLinks ?? []),
          helperNotes: step.helperNotes ?? null,
          completionRules: asJson(step.completionRules ?? {}),
        },
      })
    }

    // Remove orphan steps (present in DB, missing from the current JSON).
    // Also cascades their Tasks. This is intentional: if a step was removed
    // from the workflow definition, the related user tasks are no longer meaningful.
    const staleSteps = await prisma.workflowStep.findMany({
      where: {
        workflowId: workflow.id,
        order: { notIn: Array.from(keptOrders) },
      },
      select: { id: true, order: true },
    })
    for (const stale of staleSteps) {
      await prisma.task.deleteMany({ where: { workflowStepId: stale.id } })
      await prisma.workflowStep.delete({ where: { id: stale.id } })
    }

    console.log(`✅ Seeded workflow: ${def.slug} (${def.steps.length} steps)`)
  }
}

async function main() {
  await seedAdminUser()
  await seedWorkflows()
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
