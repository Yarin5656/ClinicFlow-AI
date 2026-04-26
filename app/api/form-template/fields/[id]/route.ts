import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth"
import { prisma } from "@/lib/db/prisma"
import { updateFormFieldSchema } from "@/lib/validations/service"

async function getOwnedField(userId: string, fieldId: string) {
  return prisma.formField.findFirst({
    where: { id: fieldId, template: { userId } },
  })
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const existing = await getOwnedField(userId, params.id)
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (existing.isCore) return NextResponse.json({ error: "Core fields cannot be modified" }, { status: 403 })

  const body = await req.json().catch(() => null)
  const parsed = updateFormFieldSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const field = await prisma.formField.update({ where: { id: params.id }, data: parsed.data })
  return NextResponse.json(field)
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const existing = await getOwnedField(userId, params.id)
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (existing.isCore) return NextResponse.json({ error: "Core fields cannot be deleted" }, { status: 403 })

  await prisma.formField.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
