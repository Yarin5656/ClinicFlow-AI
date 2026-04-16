import { NextResponse, type NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth"
import { prisma } from "@/lib/db/prisma"
import { updateTaskSchema } from "@/lib/validations/task"

async function getSessionUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions)
  return (session?.user as { id?: string } | undefined)?.id ?? null
}

async function ensureTaskOwnership(taskId: string, userId: string) {
  const task = await prisma.task.findUnique({ where: { id: taskId }, select: { userId: true } })
  if (!task) return { ok: false, status: 404, error: "המשימה לא נמצאה" } as const
  if (task.userId !== userId) return { ok: false, status: 403, error: "אין הרשאה" } as const
  return { ok: true } as const
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const userId = await getSessionUserId()
  if (!userId) return NextResponse.json({ error: "לא מחובר" }, { status: 401 })

  const ownership = await ensureTaskOwnership(params.id, userId)
  if (!ownership.ok) return NextResponse.json({ error: ownership.error }, { status: ownership.status })

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "בקשה לא תקינה" }, { status: 400 })
  }

  const parsed = updateTaskSchema.safeParse(body)
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0]
    return NextResponse.json(
      { error: firstIssue?.message ?? "נתונים לא תקינים" },
      { status: 400 }
    )
  }

  const { status, notes } = parsed.data
  const completedAt = status === "DONE" ? new Date() : status ? null : undefined

  const updated = await prisma.task.update({
    where: { id: params.id },
    data: {
      ...(status !== undefined ? { status, completedAt } : {}),
      ...(notes !== undefined ? { notes } : {}),
    },
    select: { id: true, status: true, notes: true, completedAt: true, updatedAt: true },
  })

  return NextResponse.json({ task: updated })
}
