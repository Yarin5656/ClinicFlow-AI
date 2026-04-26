import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth"
import { prisma } from "@/lib/db/prisma"
import { upsertFormTemplateSchema } from "@/lib/validations/service"

export async function GET() {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const template = await prisma.formTemplate.findUnique({
    where: { userId },
    include: { fields: { orderBy: { displayOrder: "asc" } } },
  })
  return NextResponse.json(template ?? null)
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json().catch(() => null)
  const parsed = upsertFormTemplateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const template = await prisma.formTemplate.upsert({
    where: { userId },
    create: { userId, ...parsed.data },
    update: parsed.data,
    include: { fields: { orderBy: { displayOrder: "asc" } } },
  })
  return NextResponse.json(template)
}
