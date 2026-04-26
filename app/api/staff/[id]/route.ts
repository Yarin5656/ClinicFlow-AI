import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth"
import { prisma } from "@/lib/db/prisma"
import { createStaffSchema } from "@/lib/validations/service"

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const existing = await prisma.staffMember.findFirst({ where: { id: params.id, userId } })
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })
  const body = await req.json().catch(() => null)
  const parsed = createStaffSchema.partial().safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  const member = await prisma.staffMember.update({ where: { id: params.id }, data: parsed.data })
  return NextResponse.json(member)
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const existing = await prisma.staffMember.findFirst({ where: { id: params.id, userId } })
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })
  await prisma.staffMember.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
