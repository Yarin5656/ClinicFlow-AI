import { createSharedPathnamesNavigation } from "next-intl/navigation"

export const locales = ["he", "en", "ru"] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = "he"

export const { Link, redirect, usePathname, useRouter } =
  createSharedPathnamesNavigation({ locales })
