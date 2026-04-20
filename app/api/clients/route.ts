import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth"
import { prisma } from "@/lib/db/prisma"
import { z } from "zod"

const createClientSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(7),
  source: z.string().optional(),
  treatmentWanted: z.string().optional(),
  notes: z.string().optional(),
})

export async function GET() {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const clients = await prisma.client.findMany({
    where: { userId },
    include: {
      leads: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { id: true, status: true, createdAt: true },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(clients)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const parsed = createClientSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const client = await prisma.client.create({
    data: { userId, ...parsed.data },
  })

  return NextResponse.json(client, { status: 201 })
}
