import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth"
import { prisma } from "@/lib/db/prisma"
import { createServiceSchema } from "@/lib/validations/service"

export async function GET() {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const services = await prisma.service.findMany({
    where: { userId },
    include: {
      category: { select: { id: true, name: true } },
      staff: { select: { id: true, name: true } },
      location: { select: { id: true, name: true } },
    },
    orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
  })

  return NextResponse.json(services)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json().catch(() => null)
  const parsed = createServiceSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const service = await prisma.service.create({ data: { ...parsed.data, userId } })
  return NextResponse.json(service, { status: 201 })
}
