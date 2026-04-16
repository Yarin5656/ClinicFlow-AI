import { NextResponse, type NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth"
import { prisma } from "@/lib/db/prisma"
import { getStorageProvider } from "@/lib/storage"

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
