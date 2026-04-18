import { NextResponse, type NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth"
import { prisma } from "@/lib/db/prisma"
import { updateProfileSchema } from "@/lib/validations/profile"

export async function GET() {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId) return NextResponse.json({ error: "לא מחובר" }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      email: true,
      idNumber: true,
      phoneNumber: true,
      birthDate: true,
    },
  })
  return NextResponse.json({ user })
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId) return NextResponse.json({ error: "לא מחובר" }, { status: 401 })

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "בקשה לא תקינה" }, { status: 400 })
  }

  const parsed = updateProfileSchema.safeParse(body)
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0]
    return NextResponse.json(
      { error: firstIssue?.message ?? "נתונים לא תקינים" },
      { status: 400 }
    )
  }

  const { name, idNumber, phoneNumber, birthDate } = parsed.data

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(name !== undefined ? { name: name.trim() } : {}),
      ...(idNumber !== undefined ? { idNumber: idNumber.trim() || null } : {}),
      ...(phoneNumber !== undefined ? { phoneNumber: phoneNumber.trim() || null } : {}),
      ...(birthDate !== undefined ? { birthDate: birthDate ? new Date(birthDate) : null } : {}),
    },
    select: { name: true, idNumber: true, phoneNumber: true, birthDate: true },
  })

  return NextResponse.json({ user: updated })
}
