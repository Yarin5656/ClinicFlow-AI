"use client"

import { usePathname, Link } from "@/lib/i18n/navigation"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"

function IconDashboard({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <rect x="2" y="2" width="8" height="8" rx="2" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" />
      <rect x="12" y="2" width="8" height="8" rx="2" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" />
      <rect x="2" y="12" width="8" height="8" rx="2" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" />
      <rect x="12" y="12" width="8" height="8" rx="2" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

function IconLeads({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <circle cx="8" cy="7" r="3.25" stroke="currentColor" strokeWidth="1.5" fill={active ? "currentColor" : "none"} />
      <circle cx="15" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.4" fill={active ? "currentColor" : "none"} />
      <path d="M2 17.5c0-3.314 2.686-5 6-5s6 1.686 6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M15 12.5c1.8 0 4 .9 4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

function IconTasks({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <rect x="3" y="3" width="16" height="16" rx="3" stroke="currentColor" strokeWidth="1.5" fill={active ? "currentColor" : "none"} />
      <path d="M7 11l2.5 2.5L15 8" stroke={active ? "white" : "currentColor"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconClients({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <circle cx="11" cy="7.5" r="3.5" stroke="currentColor" strokeWidth="1.5" fill={active ? "currentColor" : "none"} />
      <path d="M4 19c0-3.866 3.134-6 7-6s7 2.134 7 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function IconSettings({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <circle cx="11" cy="11" r="2.5" stroke="currentColor" strokeWidth="1.5" fill={active ? "currentColor" : "none"} />
      <path
        d="M11 2.5v1.8M11 17.7v1.8M2.5 11h1.8M17.7 11h1.8M4.93 4.93l1.27 1.27M15.8 15.8l1.27 1.27M17.07 4.93l-1.27 1.27M6.2 15.8l-1.27 1.27"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
      />
    </svg>
  )
}

export function BottomTabBar() {
  const t = useTranslations("sidebar")
  const pathname = usePathname()

  const tabs = [
    { href: "/dashboard", label: t("dashboard"), Icon: IconDashboard },
    { href: "/leads",     label: t("leads"),     Icon: IconLeads },
    { href: "/tasks",     label: t("tasks"),     Icon: IconTasks },
    { href: "/clients",   label: t("clients"),   Icon: IconClients },
    { href: "/settings",  label: t("settings"),  Icon: IconSettings },
  ]

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50 md:hidden flex items-stretch"
      style={{
        height: 64,
        background: "var(--color-surface-raised)",
        borderTop: "1px solid var(--color-border)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      {tabs.map(({ href, label, Icon }) => {
        const active = pathname === href || pathname.startsWith(href + "/")
        return (
          <Link
            key={href}
            href={href}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors"
            style={{
              color: active ? "var(--color-highlight)" : "var(--color-muted-fg)",
              fontSize: 10,
              fontWeight: active ? 600 : 400,
              letterSpacing: "0.02em",
            }}
          >
            <span className={cn("transition-transform duration-150", active && "scale-110")}>
              <Icon active={active} />
            </span>
            <span>{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
