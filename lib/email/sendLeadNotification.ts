import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

interface LeadNotificationParams {
  toEmail: string
  clinicName: string
  clientName: string
  phone: string
  treatment?: string
  message?: string
  leadsUrl: string
}

export async function sendLeadNotification(params: LeadNotificationParams): Promise<void> {
  const { toEmail, clinicName, clientName, phone, treatment, message, leadsUrl } = params

  const rows = [
    `<tr><td style="padding:4px 0;color:#6b7280;font-size:13px;">שם</td><td style="padding:4px 12px;font-weight:600;">${clientName}</td></tr>`,
    `<tr><td style="padding:4px 0;color:#6b7280;font-size:13px;">טלפון</td><td style="padding:4px 12px;font-weight:600;direction:ltr;">${phone}</td></tr>`,
    treatment ? `<tr><td style="padding:4px 0;color:#6b7280;font-size:13px;">טיפול</td><td style="padding:4px 12px;">${treatment}</td></tr>` : "",
    message ? `<tr><td style="padding:4px 0;color:#6b7280;font-size:13px;">הודעה</td><td style="padding:4px 12px;">${message}</td></tr>` : "",
  ].filter(Boolean).join("")

  const html = `
    <div dir="rtl" style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;">
      <h2 style="margin:0 0 4px;font-size:20px;">ליד חדש נכנס 🎉</h2>
      <p style="margin:0 0 20px;color:#6b7280;font-size:14px;">${clinicName}</p>
      <table style="width:100%;border-collapse:collapse;">${rows}</table>
      <div style="margin-top:24px;">
        <a href="${leadsUrl}" style="display:inline-block;background:#2563eb;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">
          לצפייה בלידים
        </a>
      </div>
    </div>
  `

  await resend.emails.send({
    from: "ClinicFlow AI <noreply@clinicflow.app>",
    to: toEmail,
    subject: `ליד חדש: ${clientName}`,
    html,
  })
}
