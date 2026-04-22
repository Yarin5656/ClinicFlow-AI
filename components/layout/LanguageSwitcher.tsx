"use client"

import { useRouter, usePathname, locales } from "@/lib/i18n/navigation"
import { useLocale } from "next-intl"
import type { Locale } from "@/lib/i18n/navigation"

const LOCALES = [
  { code: "he" as Locale, label: "עב" },
  { code: "en" as Locale, label: "EN" },
  { code: "ru" as Locale, label: "RU" },
]

export function LanguageSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  const switchLocale = (newLocale: Locale) => {
    router.replace(pathname, { locale: newLocale })
  }

  return (
    <div className="flex items-center gap-1 px-3 py-2">
      {LOCALES.map(({ code, label }, i) => (
        <span key={code} className="flex items-center gap-1">
          <button
            onClick={() => switchLocale(code)}
            className={`text-xs font-semibold transition-colors ${
              locale === code
                ? "text-white"
                : "text-white/40 hover:text-white/70"
            }`}
          >
            {label}
          </button>
          {i < LOCALES.length - 1 && (
            <span className="text-white/20 text-xs">|</span>
          )}
        </span>
      ))}
    </div>
  )
}
