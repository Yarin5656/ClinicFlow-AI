import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth"
import { prisma } from "@/lib/db/prisma"
import { z } from "zod"

const VALID_STATUSES = ["NEW", "FOLLOW_UP", "QUOTED", "BOOKED", "WON", "LOST"] as const

const updateLeadSchema = z.object({
  status: z.enum(VALID_STATUSES).optional(),
  aiSummary: z.string().optional(),
  aiTags: z.array(z.string()).optional(),
})

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const lead = await prisma.lead.findUnique({
    where: { id: params.id },
    include: {
      client: true,
      tasks: {
        include: { workflowStep: { select: { title: true, description: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  })

  if (!lead || lead.client.userId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  return NextResponse.json(lead)
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const lead = await prisma.lead.findUnique({
    where: { id: params.id },
    include: { client: { select: { userId: true } } },
  })

  if (!lead || lead.client.userId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const body = await req.json()
  const parsed = updateLeadSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const updated = await prisma.lead.update({
    where: { id: params.id },
    data: parsed.data,
  })

  return NextResponse.json(updated)
}
