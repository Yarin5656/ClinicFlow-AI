import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth"
import { prisma } from "@/lib/db/prisma"
import { saveLeadFormSchema } from "@/lib/validations/lead-form"

export async function GET() {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId) return NextResponse.json({ error: "לא מחובר" }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { leadFormSlug: true, leadFormConfig: true },
  })
  return NextResponse.json({ leadFormSlug: user?.leadFormSlug, leadFormConfig: user?.leadFormConfig })
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

  const parsed = saveLeadFormSchema.safeParse(body)
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0]
    return NextResponse.json({ error: firstIssue?.message ?? "נתונים לא תקינים" }, { status: 400 })
  }

  const { slug, config } = parsed.data

  // Check slug uniqueness (excluding current user)
  const existing = await prisma.user.findFirst({
    where: { leadFormSlug: slug, NOT: { id: userId } },
  })
  if (existing) {
    return NextResponse.json({ error: "הקישור תפוס, נסה אחר" }, { status: 409 })
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { leadFormSlug: slug, leadFormConfig: config },
    select: { leadFormSlug: true, leadFormConfig: true },
  })

  return NextResponse.json(updated)
}
