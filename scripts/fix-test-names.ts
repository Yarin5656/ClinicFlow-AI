import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

async function main() {
  // Fix Yossi's name + address
  await prisma.user.update({
    where: { email: "yossi@test.com" },
    data: { name: "יוסי" },
  })
  await prisma.household.updateMany({
    where: { user: { email: "yossi@test.com" } },
    data: { toAddress: "רמת גן" },
  })

  // Clean up mojibake reminders + notes, add fresh ones
  const user = await prisma.user.findUnique({ where: { email: "yossi@test.com" } })
  if (!user) return
  await prisma.reminder.deleteMany({ where: { userId: user.id } })
  await prisma.task.updateMany({ where: { userId: user.id, notes: { not: null } }, data: { notes: null } })

  const now = Date.now()
  const oneHourAgo = new Date(now - 60 * 60 * 1000)
  const tomorrow = new Date(now + 24 * 60 * 60 * 1000)
  const nextWeek = new Date(now + 7 * 24 * 60 * 60 * 1000)

  await prisma.reminder.createMany({
    data: [
      { userId: user.id, message: "להביא חוזה שכירות מקורי לעירייה", scheduledAt: oneHourAgo, seen: false },
      { userId: user.id, message: "לבדוק זכאות להנחת ארנונה בתור סטודנט", scheduledAt: tomorrow, seen: false },
      { userId: user.id, message: "לעדכן כתובת בבנק הפועלים", scheduledAt: nextWeek, seen: false },
    ],
  })

  console.log("cleaned + refreshed")
  await prisma.$disconnect()
}

main()
