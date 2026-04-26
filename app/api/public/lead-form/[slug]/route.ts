import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { publicSubmitSchema, type LeadFormConfig } from "@/lib/validations/lead-form"
import { generateFollowUpTasksForLead } from "@/lib/workflows/leads"
import { sendLeadNotification } from "@/lib/email/sendLeadNotification"
import { checkRateLimit } from "@/lib/rateLimit"

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown"
  const { allowed } = checkRateLimit(`lead-form:${ip}`, 5, 10 * 60 * 1000)
  if (!allowed) return NextResponse.json({ error: "נסה שוב מאוחר יותר" }, { status: 429 })

  const user = await prisma.user.findUnique({
    where: { leadFormSlug: params.slug },
    select: {
      id: true, email: true, name: true, leadFormConfig: true,
      formTemplate: { select: { isActive: true, title: true } },
    },
  })
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const hasNewTemplate = user.formTemplate?.isActive
  const legacyConfig = user.leadFormConfig as LeadFormConfig | null
  if (!hasNewTemplate && !legacyConfig?.active) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: "בקשה לא תקינה" }, { status: 400 })
  }

  const parsed = publicSubmitSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "נתונים לא תקינים" }, { status: 400 })
  }

  const { name, phone, serviceId, treatment, source, message, answers } = parsed.data

  if (serviceId) {
    const service = await prisma.service.findFirst({ where: { id: serviceId, userId: user.id, isActive: true } })
    if (!service) return NextResponse.json({ error: "שירות לא נמצא" }, { status: 400 })
  }

  const { lead } = await prisma.$transaction(async (tx) => {
    const client = await tx.client.create({
      data: {
        userId: user.id,
        name,
        phone,
        source: source ?? "טופס אונליין",
        treatmentWanted: treatment,
        notes: message,
      },
    })
    const lead = await tx.lead.create({
      data: {
        clientId: client.id,
        status: "NEW",
        serviceId: serviceId ?? null,
        formAnswers: Object.keys(answers).length > 0 ? (answers as any) : undefined,
      },
    })
    return { client, lead }
  })

  try { await generateFollowUpTasksForLead(user.id, lead.id, "lead-intake") } catch (e) {
    console.error("[lead-form] workflow error", e)
  }

  const formTitle = user.formTemplate?.title ?? (legacyConfig?.title ?? "טופס")
  try {
    const baseUrl = process.env.NEXTAUTH_URL ?? "https://clinicflow-ai-xi.vercel.app"
    await sendLeadNotification({
      toEmail: user.email,
      clinicName: formTitle,
      clientName: name,
      phone,
      treatment,
      message,
      leadsUrl: `${baseUrl}/he/leads`,
    })
  } catch { /* best-effort */ }

  return NextResponse.json({ ok: true }, { status: 201 })
}
