import type { Metadata } from "next"
import { Heebo, Frank_Ruhl_Libre, Rubik } from "next/font/google"
import "../globals.css"
import { Providers } from "@/components/layout/Providers"
import { NextIntlClientProvider } from "next-intl"
import { getMessages } from "next-intl/server"
import { notFound } from "next/navigation"

const locales = ["he", "en", "ru"] as const

const heebo = Heebo({
  subsets: ["hebrew", "latin"],
  variable: "--font-heebo",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
})

const frankRuhlLibre = Frank_Ruhl_Libre({
  subsets: ["hebrew", "latin"],
  variable: "--font-frank",
  weight: ["400", "500", "700"],
  display: "swap",
})

const rubik = Rubik({
  subsets: ["hebrew", "latin", "cyrillic"],
  variable: "--font-rubik",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "ClinicFlow AI — Back Office לקליניקות אסתטיקה",
  description: "מרכז פניות, פולואפים אוטומטיים ודשבורד לידים לקליניקות אסתטיקה",
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  const { locale } = params

  if (!locales.includes(locale as (typeof locales)[number])) {
    notFound()
  }

  const messages = await getMessages()
  const dir = locale === "he" ? "rtl" : "ltr"
  const fontClass =
    locale === "ru"
      ? `${rubik.variable} ${frankRuhlLibre.variable}`
      : `${heebo.variable} ${frankRuhlLibre.variable}`

  return (
    <html lang={locale} dir={dir} className={fontClass}>
      <body className="bg-surface text-[var(--color-text)] font-sans antialiased">
        <NextIntlClientProvider messages={messages}>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
