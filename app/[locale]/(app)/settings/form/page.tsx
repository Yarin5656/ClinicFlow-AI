import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth"
import { prisma } from "@/lib/db/prisma"
import { FormBuilder } from "@/components/settings/FormBuilder"

export default async function FormSettingsPage({ params }: { params: { locale: string } }) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId) redirect(`/${params.locale}/login`)

  const [template, user] = await Promise.all([
    prisma.formTemplate.findUnique({
      where: { userId },
      include: { fields: { orderBy: { displayOrder: "asc" } } },
    }),
    prisma.user.findUnique({ where: { id: userId }, select: { leadFormSlug: true } }),
  ])

  const slug = user?.leadFormSlug
  const baseUrl = process.env.NEXTAUTH_URL ?? "https://clinicflow-ai-xi.vercel.app"

  return (
    <div className="p-6 lg:p-8" dir="rtl">
      <div className="flex items-start justify-between mb-6 gap-4">
        <h1 className="font-display text-2xl font-bold text-[var(--color-text)]">טופס לידים</h1>
        {slug && (
          <a
            href={`${baseUrl}/f/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 text-sm underline"
            style={{ color: "var(--color-highlight)" }}
          >
            צפה בטופס ↗
          </a>
        )}
      </div>
      <FormBuilder
        templateId={template?.id ?? null}
        fields={template?.fields ?? []}
        title={template?.title ?? "השאר פרטים"}
        subtitle={template?.subtitle ?? ""}
        isActive={template?.isActive ?? false}
      />
    </div>
  )
}
