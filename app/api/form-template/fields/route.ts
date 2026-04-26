import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth"
import { prisma } from "@/lib/db/prisma"
import { createFormFieldSchema } from "@/lib/validations/service"

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const template = await prisma.formTemplate.findUnique({ where: { userId } })
  if (!template) return NextResponse.json({ error: "Create a form template first" }, { status: 404 })

  const body = await req.json().catch(() => null)
  const parsed = createFormFieldSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const existing = await prisma.formField.findFirst({ where: { templateId: template.id, key: parsed.data.key } })
  if (existing) return NextResponse.json({ error: "Field key already exists" }, { status: 409 })

  const field = await prisma.formField.create({
    data: { templateId: template.id, ...parsed.data },
  })
  return NextResponse.json(field, { status: 201 })
}
