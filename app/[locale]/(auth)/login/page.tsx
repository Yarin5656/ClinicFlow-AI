import { Suspense } from "react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth"
import { LoginForm } from "@/components/auth/LoginForm"
import { getTranslations } from "next-intl/server"

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: "auth" })
  return { title: `${t("loginTitle")} — ClinicFlow AI` }
}

export default async function LoginPage({ params }: { params: { locale: string } }) {
  const session = await getServerSession(authOptions)
  if (session) redirect(`/${params.locale}/dashboard`)

  const t = await getTranslations({ locale: params.locale, namespace: "auth" })

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12 relative">
      {/* Background ambient */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 75% 20%, oklch(94% 0.05 10 / 0.6), transparent 60%), " +
            "radial-gradient(ellipse at 15% 90%, oklch(94% 0.04 10 / 0.4), transparent 60%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-[0.35]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, oklch(88% 0.015 245) 1px, transparent 0)",
          backgroundSize: "18px 18px",
        }}
      />

      <div className="relative w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link
            href={`/${params.locale}`}
            className="inline-flex items-baseline gap-1.5 mb-4"
          >
            <span className="font-display text-2xl font-bold text-primary">
              ClinicFlow
            </span>
            <span className="text-xs text-[var(--color-highlight)] font-semibold uppercase tracking-wider">
              AI
            </span>
          </Link>
          <h1 className="font-display text-2xl font-bold text-[var(--color-text)] mb-1">
            {t("loginTitle")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("loginSubtitle")}
          </p>
        </div>

        <div className="bg-surface-raised rounded-2xl border border-border shadow-card p-6 lg:p-8">
          <Suspense fallback={null}>
            <LoginForm locale={params.locale} />
          </Suspense>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {t("noAccount")}{" "}
          <Link
            href={`/${params.locale}/register`}
            className="text-[var(--color-highlight)] hover:underline underline-offset-2 font-bold"
          >
            {t("registerLink")}
          </Link>
        </p>
      </div>
    </main>
  )
}
