import { type NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import fs from "fs/promises"
import { authOptions } from "@/lib/auth/auth"
import { prisma } from "@/lib/db/prisma"
import { getStorageProvider } from "@/lib/storage"

/**
 * Auth-gated file download.
 * Files live outside /public so they can't be accessed directly by URL.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId) return new Response("Unauthorized", { status: 401 })

  const doc = await prisma.document.findUnique({
    where: { id: params.id },
    select: { userId: true, storagePath: true, mimeType: true, filename: true },
  })
  if (!doc) return new Response("Not found", { status: 404 })
  if (doc.userId !== userId) return new Response("Forbidden", { status: 403 })

  const storage = getStorageProvider()
  const absolutePath = storage.getFullPath(doc.storagePath)

  let buffer: Buffer
  try {
    buffer = await fs.readFile(absolutePath)
  } catch {
    return new Response("File missing from storage", { status: 410 })
  }

  const arrayBuffer = buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength
  ) as ArrayBuffer

  return new Response(arrayBuffer, {
    headers: {
      "Content-Type": doc.mimeType,
      "Content-Disposition": `inline; filename="${encodeURIComponent(doc.filename)}"`,
      "Cache-Control": "private, no-store",
    },
  })
}
