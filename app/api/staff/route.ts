import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth"
import { prisma } from "@/lib/db/prisma"
import { createStaffSchema } from "@/lib/validations/service"

export async function GET() {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const staff = await prisma.staffMember.findMany({ where: { userId }, orderBy: { createdAt: "asc" } })
  return NextResponse.json(staff)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const body = await req.json().catch(() => null)
  const parsed = createStaffSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  const member = await prisma.staffMember.create({ data: { ...parsed.data, userId } })
  return NextResponse.json(member, { status: 201 })
}
