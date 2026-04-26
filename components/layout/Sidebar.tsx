"use client"

import { usePathname, Link } from "@/lib/i18n/navigation"
import { useTranslations } from "next-intl"
import { signOut } from "next-auth/react"
import { useParams } from "next/navigation"
import { cn } from "@/lib/utils"
import { LanguageSwitcher } from "./LanguageSwitcher"

export function Sidebar() {
  const t = useTranslations("sidebar")
  const pathname = usePathname()
  const params = useParams()
  const locale = (params?.locale as string) ?? "he"

  const navItems = [
    { href: "/dashboard", label: t("dashboard"), icon: "◉" },
    { href: "/leads",     label: t("leads"),     icon: "👥" },
    { href: "/tasks",     label: t("tasks"),      icon: "✓" },
    { href: "/clients",   label: t("clients"),    icon: "◫" },
    { href: "/reminders", label: t("reminders"),  icon: "◐" },
    { href: "/settings",  label: t("settings"),   icon: "◎" },
  ]

  return (
    <aside
      className="hidden md:flex w-60 shrink-0 flex-col h-full relative overflow-hidden"
      style={{
        background: "linear-gradient(180deg, oklch(22% 0.07 245) 0%, oklch(18% 0.06 245) 100%)",
        color: "var(--color-primary-fg)",
      }}
    >
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "16px 16px",
        }}
      />

      <Link
        href="/dashboard"
        className="relative h-16 flex items-center px-5 border-b border-white/10"
      >
        <div className="flex items-baseline gap-1.5">
          <span className="font-display font-bold text-lg">ClinicFlow</span>
          <span className="text-[10px] text-[var(--color-highlight)] font-medium uppercase tracking-wider">
            AI
          </span>
        </div>
      </Link>

      <nav className="relative flex-1 p-3 flex flex-col gap-1 overflow-y-auto" aria-label="navigation">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors duration-150",
                active
                  ? "bg-white/10 text-white font-semibold"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              )}
            >
              {active && (
                <span
                  className="absolute right-0 top-2 bottom-2 w-0.5 rounded-full"
                  style={{ background: "var(--color-highlight)" }}
                  aria-hidden
                />
              )}
              <span
                className={cn(
                  "font-mono text-base leading-none w-5 text-center",
                  active ? "text-[var(--color-highlight)]" : "opacity-70"
                )}
                aria-hidden
              >
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="relative border-t border-white/10">
        <LanguageSwitcher />
        <div className="px-3 pb-3">
          <button
            onClick={() => signOut({ callbackUrl: `/${locale}/login` })}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/70 hover:bg-white/5 hover:text-white transition-colors w-full"
          >
            <span className="font-mono text-base leading-none w-5 text-center opacity-70" aria-hidden>←</span>
            <span>{t("logout")}</span>
          </button>
        </div>
      </div>
    </aside>
  )
}
