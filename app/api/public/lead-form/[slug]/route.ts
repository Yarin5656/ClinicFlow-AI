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
  if (!allowed) {
    return NextResponse.json({ error: "נסה שוב מאוחר יותר" }, { status: 429 })
  }

  const user = await prisma.user.findUnique({
    where: { leadFormSlug: params.slug },
    select: { id: true, email: true, name: true, leadFormConfig: true },
  })

  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const config = user.leadFormConfig as LeadFormConfig | null
  if (!config?.active) return NextResponse.json({ error: "Not found" }, { status: 404 })

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "בקשה לא תקינה" }, { status: 400 })
  }

  const parsed = publicSubmitSchema.safeParse(body)
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0]
    return NextResponse.json({ error: firstIssue?.message ?? "נתונים לא תקינים" }, { status: 400 })
  }

  const { name, phone, treatment, source, message } = parsed.data

  const client = await prisma.client.create({
    data: {
      userId: user.id,
      name,
      phone,
      source: source ?? "טופס רשתות חברתיות",
      treatmentWanted: treatment,
      notes: message,
    },
  })

  const lead = await prisma.lead.create({
    data: { clientId: client.id, status: "NEW" },
  })

  try {
    await generateFollowUpTasksForLead(user.id, lead.id, "lead-intake")
  } catch {
    // best-effort
  }

  try {
    const baseUrl = process.env.NEXTAUTH_URL ?? "https://clinicflow-ai-xi.vercel.app"
    await sendLeadNotification({
      toEmail: user.email,
      clinicName: config.title,
      clientName: name,
      phone,
      treatment,
      message,
      leadsUrl: `${baseUrl}/he/leads`,
    })
  } catch {
    // best-effort — lead is saved
  }

  return NextResponse.json({ ok: true }, { status: 201 })
}
