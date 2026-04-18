import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth"
import { prisma } from "@/lib/db/prisma"
import { getStorageProvider } from "@/lib/storage"
import type { Prisma } from "@prisma/client"

const updateDocSchema = z.object({
  docType: z.string().max(40).nullable().optional(),
  extractedFields: z.record(z.string(), z.union([z.string(), z.number(), z.null()])).optional(),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId) return NextResponse.json({ error: "לא מחובר" }, { status: 401 })

  const doc = await prisma.document.findUnique({
    where: { id: params.id },
    select: { userId: true },
  })
  if (!doc) return NextResponse.json({ error: "המסמך לא נמצא" }, { status: 404 })
  if (doc.userId !== userId) return NextResponse.json({ error: "אין הרשאה" }, { status: 403 })

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "בקשה לא תקינה" }, { status: 400 })
  }

  const parsed = updateDocSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "נתונים לא תקינים" }, { status: 400 })
  }

  const data: Prisma.DocumentUpdateInput = {}
  if (parsed.data.docType !== undefined) data.docType = parsed.data.docType
  if (parsed.data.extractedFields !== undefined) {
    data.extractedFields = parsed.data.extractedFields as Prisma.InputJsonValue
  }

  const updated = await prisma.document.update({
    where: { id: params.id },
    data,
    select: { id: true, docType: true, extractedFields: true },
  })

  return NextResponse.json({ document: updated })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId) return NextResponse.json({ error: "לא מחובר" }, { status: 401 })

  const doc = await prisma.document.findUnique({
    where: { id: params.id },
    select: { userId: true, storagePath: true },
  })
  if (!doc) return NextResponse.json({ error: "המסמך לא נמצא" }, { status: 404 })
  if (doc.userId !== userId) return NextResponse.json({ error: "אין הרשאה" }, { status: 403 })

  const storage = getStorageProvider()
  await storage.delete(doc.storagePath)
  await prisma.document.delete({ where: { id: params.id } })

  return NextResponse.json({ success: true })
}
