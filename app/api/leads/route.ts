import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth"
import { prisma } from "@/lib/db/prisma"
import { z } from "zod"
import { generateFollowUpTasksForLead } from "@/lib/workflows/leads"

const createLeadSchema = z.object({
  clientId: z.string().min(1),
  aiSummary: z.string().optional(),
  aiTags: z.array(z.string()).optional(),
})

export async function GET() {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const leads = await prisma.lead.findMany({
    where: { client: { userId } },
    include: {
      client: { select: { name: true, phone: true, source: true, treatmentWanted: true } },
      tasks: {
        include: { workflowStep: { select: { title: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(leads)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const parsed = createLeadSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const client = await prisma.client.findUnique({ where: { id: parsed.data.clientId } })
  if (!client || client.userId !== userId) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 })
  }

  const lead = await prisma.lead.create({
    data: {
      clientId: parsed.data.clientId,
      aiSummary: parsed.data.aiSummary,
      aiTags: parsed.data.aiTags ?? [],
      status: "NEW",
    },
  })

  await generateFollowUpTasksForLead(userId, lead.id, "lead-intake")

  return NextResponse.json(lead, { status: 201 })
}
