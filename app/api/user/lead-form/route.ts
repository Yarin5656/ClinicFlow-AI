import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth"
import { prisma } from "@/lib/db/prisma"
import { saveLeadFormSchema } from "@/lib/validations/lead-form"
import { Prisma } from "@prisma/client"
import { z } from "zod"

export async function GET() {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId) return NextResponse.json({ error: "לא מחובר" }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { leadFormSlug: true, leadFormConfig: true },
  })
  if (!user) return NextResponse.json({ error: "משתמש לא נמצא" }, { status: 404 })
  return NextResponse.json({ leadFormSlug: user.leadFormSlug, leadFormConfig: user.leadFormConfig })
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

  // Support slug-only updates (from SlugEditor) or full config updates
  const slugOnly = z.object({
    slug: z.string().min(3).max(40).regex(/^[a-z0-9-]+$/),
  })
  const slugOnlyParsed = slugOnly.safeParse(body)

  if (slugOnlyParsed.success && !("config" in (body as object))) {
    try {
      const updated = await prisma.user.update({
        where: { id: userId },
        data: { leadFormSlug: slugOnlyParsed.data.slug },
        select: { leadFormSlug: true },
      })
      return NextResponse.json(updated)
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        return NextResponse.json({ error: "הקישור תפוס, נסה אחר" }, { status: 409 })
      }
      throw e
    }
  }

  const parsed = saveLeadFormSchema.safeParse(body)
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0]
    return NextResponse.json({ error: firstIssue?.message ?? "נתונים לא תקינים" }, { status: 400 })
  }

  const { slug, config } = parsed.data

  let updated
  try {
    updated = await prisma.user.update({
      where: { id: userId },
      data: { leadFormSlug: slug, leadFormConfig: config },
      select: { leadFormSlug: true, leadFormConfig: true },
    })
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return NextResponse.json({ error: "הקישור תפוס, נסה אחר" }, { status: 409 })
    }
    throw e
  }
  return NextResponse.json(updated)
}
