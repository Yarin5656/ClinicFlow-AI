import { NextResponse, type NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth"
import { prisma } from "@/lib/db/prisma"
import { createReminderSchema } from "@/lib/validations/reminder"

async function getUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions)
  return (session?.user as { id?: string } | undefined)?.id ?? null
}

export async function GET() {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: "לא מחובר" }, { status: 401 })

  const reminders = await prisma.reminder.findMany({
    where: { userId },
    include: {
      task: {
        select: {
          id: true,
          workflowStep: { select: { title: true } },
        },
      },
    },
    orderBy: { scheduledAt: "asc" },
  })

  const now = Date.now()
  const dueUnseenCount = reminders.filter(
    (r) => !r.seen && r.scheduledAt.getTime() <= now
  ).length

  return NextResponse.json({ reminders, dueUnseenCount })
}

export async function POST(req: NextRequest) {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: "לא מחובר" }, { status: 401 })

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "בקשה לא תקינה" }, { status: 400 })
  }

  const parsed = createReminderSchema.safeParse(body)
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0]
    return NextResponse.json(
      { error: firstIssue?.message ?? "נתונים לא תקינים" },
      { status: 400 }
    )
  }

  const { message, scheduledAt, taskId } = parsed.data

  // Validate task ownership if provided
  if (taskId) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: { userId: true },
    })
    if (!task || task.userId !== userId) {
      return NextResponse.json({ error: "משימה לא נמצאה או שאין הרשאה" }, { status: 404 })
    }
  }

  const reminder = await prisma.reminder.create({
    data: {
      userId,
      message: message.trim(),
      scheduledAt: new Date(scheduledAt),
      taskId: taskId ?? null,
    },
  })

  return NextResponse.json({ reminder }, { status: 201 })
}
