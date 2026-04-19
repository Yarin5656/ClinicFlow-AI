import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

async function main() {
  const users = await prisma.user.findMany({
    include: {
      _count: { select: { tasks: true, documents: true, reminders: true } },
      household: { include: { moveProfile: true } },
    },
  })
  for (const u of users) {
    console.log(
      `${u.email}: tasks=${u._count.tasks}, docs=${u._count.documents}, reminders=${u._count.reminders}, hasProfile=${!!u.household?.moveProfile}`
    )
  }
  await prisma.$disconnect()
}

main()
