import { cache } from "react"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/db/prisma"
import { PublicLeadForm } from "@/components/f/PublicLeadForm"
import type { LeadFormConfig } from "@/lib/validations/lead-form"

const getFormData = cache(async (slug: string) => {
  const user = await prisma.user.findUnique({
    where: { leadFormSlug: slug },
    select: {
      leadFormConfig: true,
      formTemplate: {
        include: { fields: { orderBy: { displayOrder: "asc" } } },
      },
      services: {
        where: { isActive: true },
        orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
        select: { id: true, name: true, description: true, priceType: true, priceValue: true, durationMin: true },
      },
    },
  })
  return user
})

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const data = await getFormData(params.slug)
  const title = data?.formTemplate?.title
    ?? (data?.leadFormConfig as LeadFormConfig | null)?.title
    ?? "השאר פרטים"
  return { title }
}

export default async function PublicFormPage({ params }: { params: { slug: string } }) {
  const data = await getFormData(params.slug)

  const template = data?.formTemplate
  const legacyConfig = data?.leadFormConfig as LeadFormConfig | null

  if (template?.isActive) {
    return <FormPageShell title={template.title} subtitle={template.subtitle ?? undefined}>
      <PublicLeadForm
        slug={params.slug}
        fields={template.fields}
        services={data?.services ?? []}
        title={template.title}
      />
    </FormPageShell>
  }

  if (legacyConfig?.active) {
    return <FormPageShell title={legacyConfig.title} subtitle={legacyConfig.subtitle}>
      <PublicLeadForm slug={params.slug} config={legacyConfig} />
    </FormPageShell>
  }

  notFound()
}

function FormPageShell({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <main
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: "linear-gradient(135deg, oklch(96% 0.03 245) 0%, oklch(98% 0.02 10) 100%)" }}
    >
      <div className="w-full max-w-md">
        <div className="text-center mb-8" dir="rtl">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[var(--color-highlight)] text-white text-2xl font-bold mb-4 shadow-lg">✦</div>
          <h1 className="font-display text-2xl font-bold text-[var(--color-text)] mb-2">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        <div className="bg-white rounded-2xl border border-border shadow-card p-6">{children}</div>
        <p className="text-center text-xs text-muted-foreground mt-6">
          מופעל על ידי{" "}
          <span className="font-semibold text-[var(--color-highlight)]">ClinicFlow AI</span>
        </p>
      </div>
    </main>
  )
}
