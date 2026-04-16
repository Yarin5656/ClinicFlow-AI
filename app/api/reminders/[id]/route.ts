import { NextResponse, type NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth"
import { prisma } from "@/lib/db/prisma"
import { updateReminderSchema } from "@/lib/validations/reminder"

async function getUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions)
  return (session?.user as { id?: string } | undefined)?.id ?? null
}

async function ensureOwnership(reminderId: string, userId: string) {
  const reminder = await prisma.reminder.findUnique({
    where: { id: reminderId },
    select: { userId: true },
  })
  if (!reminder) return { ok: false, status: 404, error: "התזכורת לא נמצאה" } as const
  if (reminder.userId !== userId) return { ok: false, status: 403, error: "אין הרשאה" } as const
  return { ok: true } as const
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: "לא מחובר" }, { status: 401 })

  const ownership = await ensureOwnership(params.id, userId)
  if (!ownership.ok) return NextResponse.json({ error: ownership.error }, { status: ownership.status })

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "בקשה לא תקינה" }, { status: 400 })
  }

  const parsed = updateReminderSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "נתונים לא תקינים" }, { status: 400 })
  }

  const updated = await prisma.reminder.update({
    where: { id: params.id },
    data: parsed.data,
  })

  return NextResponse.json({ reminder: updated })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: "לא מחובר" }, { status: 401 })

  const ownership = await ensureOwnership(params.id, userId)
  if (!ownership.ok) return NextResponse.json({ error: ownership.error }, { status: ownership.status })

  await prisma.reminder.delete({ where: { id: params.id } })

  return NextResponse.json({ success: true })
}
