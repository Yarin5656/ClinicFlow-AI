import createMiddleware from "next-intl/middleware"
import { getToken } from "next-auth/jwt"
import { NextRequest, NextResponse } from "next/server"

const locales = ["he", "en", "ru"] as const
const defaultLocale = "he"

const protectedSegments = [
  "dashboard", "leads", "tasks", "clients",
  "reminders", "settings", "documents", "onboarding",
]

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "always",
})

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Let next-intl handle locale routing first
  const response = intlMiddleware(req)

  // Determine if this is a protected path: /{locale}/dashboard, /{locale}/leads, etc.
  const segments = pathname.split("/").filter(Boolean)
  const isProtected =
    segments.length >= 2 &&
    locales.includes(segments[0] as (typeof locales)[number]) &&
    protectedSegments.includes(segments[1])

  if (isProtected) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    if (!token) {
      const locale = segments[0] ?? defaultLocale
      const loginUrl = new URL(`/${locale}/login`, req.url)
      loginUrl.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return response
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
}
