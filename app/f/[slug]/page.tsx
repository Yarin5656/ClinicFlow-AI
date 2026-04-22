import { notFound } from "next/navigation"
import { prisma } from "@/lib/db/prisma"
import { PublicLeadForm } from "@/components/f/PublicLeadForm"
import type { LeadFormConfig } from "@/lib/validations/lead-form"

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const user = await prisma.user.findUnique({
    where: { leadFormSlug: params.slug },
    select: { leadFormConfig: true },
  })
  const config = user?.leadFormConfig as LeadFormConfig | null
  return { title: config?.title ?? "השאר פרטים" }
}

export default async function PublicFormPage({ params }: { params: { slug: string } }) {
  const user = await prisma.user.findUnique({
    where: { leadFormSlug: params.slug },
    select: { leadFormConfig: true },
  })

  const config = user?.leadFormConfig as LeadFormConfig | null
  if (!config?.active) notFound()

  return (
    <main
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{
        background: "linear-gradient(135deg, oklch(96% 0.03 245) 0%, oklch(98% 0.02 10) 100%)",
      }}
    >
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8" dir="rtl">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[var(--color-highlight)] text-white text-2xl font-bold mb-4 shadow-lg">
            ✦
          </div>
          <h1 className="font-display text-2xl font-bold text-[var(--color-text)] mb-2">
            {config.title}
          </h1>
          {config.subtitle && (
            <p className="text-sm text-muted-foreground">{config.subtitle}</p>
          )}
        </div>

        {/* Form card */}
        <div className="bg-white rounded-2xl border border-border shadow-card p-6">
          <PublicLeadForm slug={params.slug} config={config} />
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          מופעל על ידי{" "}
          <span className="font-semibold text-[var(--color-highlight)]">ClinicFlow AI</span>
        </p>
      </div>
    </main>
  )
}
