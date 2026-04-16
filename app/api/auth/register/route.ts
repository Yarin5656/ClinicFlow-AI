import { NextResponse, type NextRequest } from "next/server"
import { hash } from "bcryptjs"
import { prisma } from "@/lib/db/prisma"
import { registerSchema } from "@/lib/validations/auth"

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json(
      { error: "בקשה לא תקינה" },
      { status: 400 }
    )
  }

  const parsed = registerSchema.safeParse(body)
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0]
    return NextResponse.json(
      { error: firstIssue?.message ?? "נתונים לא תקינים", issues: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const { name, email, password } = parsed.data
  const normalizedEmail = email.toLowerCase().trim()

  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } })
  if (existing) {
    return NextResponse.json(
      { error: "משתמש עם אימייל זה כבר קיים" },
      { status: 409 }
    )
  }

  const passwordHash = await hash(password, 10)

  const user = await prisma.user.create({
    data: {
      email: normalizedEmail,
      passwordHash,
      name: name.trim(),
    },
    select: { id: true, email: true, name: true },
  })

  return NextResponse.json({ user }, { status: 201 })
}
