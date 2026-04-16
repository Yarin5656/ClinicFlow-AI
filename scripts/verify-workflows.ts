import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  const workflows = await prisma.workflow.findMany({
    include: { steps: { orderBy: { order: "asc" } } },
    orderBy: { order: "asc" },
  })

  for (const w of workflows) {
    console.log(`\n📋 ${w.slug}  —  ${w.title}`)
    console.log(`   ${w.description}`)
    for (const s of w.steps) {
      const triggers = s.triggerConditions as Record<string, unknown> | null
      const triggerStr = triggers && Object.keys(triggers).length > 0
        ? ` [conditions: ${JSON.stringify(triggers)}]`
        : ""
      const docCount = Array.isArray(s.requiredDocuments) ? s.requiredDocuments.length : 0
      const linkCount = Array.isArray(s.externalLinks) ? s.externalLinks.length : 0
      console.log(`   ${s.order}. ${s.title}${triggerStr}`)
      console.log(`      — ${docCount} docs, ${linkCount} links`)
    }
  }

  console.log(`\n✅ Total: ${workflows.length} workflows, ${workflows.reduce((sum, w) => sum + w.steps.length, 0)} steps`)
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
