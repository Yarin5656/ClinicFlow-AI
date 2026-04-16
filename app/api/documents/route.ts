import { NextResponse, type NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth"
import { prisma } from "@/lib/db/prisma"
import { getStorageProvider } from "@/lib/storage"

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB
const ALLOWED_MIME = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
])

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId) return NextResponse.json({ error: "לא מחובר" }, { status: 401 })

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ error: "בקשה לא תקינה" }, { status: 400 })
  }

  const file = formData.get("file")
  const taskId = formData.get("taskId")

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "לא התקבל קובץ" }, { status: 400 })
  }
  if (file.size === 0) {
    return NextResponse.json({ error: "הקובץ ריק" }, { status: 400 })
  }
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: `הקובץ גדול מדי (מקסימום ${MAX_FILE_SIZE / (1024 * 1024)} מגה)` },
      { status: 400 }
    )
  }
  if (!ALLOWED_MIME.has(file.type)) {
    return NextResponse.json(
      { error: "סוג קובץ לא נתמך. ניתן להעלות PDF, JPEG, PNG, WEBP, DOC/DOCX." },
      { status: 400 }
    )
  }

  // If taskId provided, verify ownership
  if (typeof taskId === "string" && taskId.length > 0) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: { userId: true },
    })
    if (!task) return NextResponse.json({ error: "המשימה לא נמצאה" }, { status: 404 })
    if (task.userId !== userId) return NextResponse.json({ error: "אין הרשאה" }, { status: 403 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const storage = getStorageProvider()
  const storagePath = await storage.upload(buffer, file.name, file.type, userId)

  const doc = await prisma.document.create({
    data: {
      userId,
      taskId: typeof taskId === "string" && taskId.length > 0 ? taskId : null,
      filename: file.name,
      storagePath,
      mimeType: file.type,
      sizeBytes: file.size,
    },
    select: {
      id: true,
      filename: true,
      mimeType: true,
      sizeBytes: true,
      uploadedAt: true,
      taskId: true,
    },
  })

  return NextResponse.json({ document: doc }, { status: 201 })
}
