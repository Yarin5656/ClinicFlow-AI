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
  localeDetection: false,
})

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (pathname.startsWith("/f/")) return NextResponse.next()

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

  return intlMiddleware(req)
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
}
