"use client"

import { useRouter, usePathname } from "@/lib/i18n/navigation"
import { useLocale } from "next-intl"

const LOCALES = [
  { code: "he", label: "עב" },
  { code: "en", label: "EN" },
  { code: "ru", label: "RU" },
] as const

export function LanguageSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  const switchLocale = (newLocale: string) => {
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
