import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth"
import { prisma } from "@/lib/db/prisma"
import { z } from "zod"

const updateClientSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().min(7).optional(),
  source: z.string().optional(),
  treatmentWanted: z.string().optional(),
  notes: z.string().optional(),
})

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const client = await prisma.client.findUnique({
    where: { id: params.id },
    include: {
      leads: {
        orderBy: { createdAt: "desc" },
        include: {
          tasks: {
            include: { workflowStep: { select: { title: true } } },
            orderBy: { createdAt: "asc" },
          },
        },
      },
    },
  })

  if (!client || client.userId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  return NextResponse.json(client)
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const client = await prisma.client.findUnique({ where: { id: params.id } })
  if (!client || client.userId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const body = await req.json()
  const parsed = updateClientSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const updated = await prisma.client.update({
    where: { id: params.id },
    data: parsed.data,
  })

  return NextResponse.json(updated)
}
