import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth"
import { prisma } from "@/lib/db/prisma"
import { updateServiceSchema } from "@/lib/validations/service"

async function getOwnedService(userId: string, id: string) {
  return prisma.service.findFirst({ where: { id, userId } })
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const existing = await getOwnedService(userId, params.id)
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const body = await req.json().catch(() => null)
  const parsed = updateServiceSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const service = await prisma.service.update({ where: { id: params.id }, data: parsed.data })
  return NextResponse.json(service)
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const existing = await getOwnedService(userId, params.id)
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })

  await prisma.service.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
