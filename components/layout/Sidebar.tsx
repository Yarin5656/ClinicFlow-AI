"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/dashboard", label: "לוח בקרה", icon: "⊞" },
  { href: "/documents", label: "מסמכים", icon: "📄" },
  { href: "/reminders", label: "תזכורות", icon: "🔔" },
]

export function Sidebar() {
  const pathname = usePathname()
  return (
    <aside className="w-56 shrink-0 border-l border-border bg-surface-raised flex flex-col h-full">
      <div className="h-16 flex items-center px-5 border-b border-border">
        <span className="font-display font-bold text-lg text-primary">MoveEasy</span>
        <span className="text-xs text-muted-foreground mr-2 mt-0.5">ישראל</span>
      </div>
      <nav className="flex-1 p-3 flex flex-col gap-1" aria-label="ניווט ראשי">
        {navItems.map((item) => {
          const active = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors duration-150",
                active
                  ? "bg-primary text-primary-foreground font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-[var(--color-text)]"
              )}
            >
              <span className="text-base leading-none" aria-hidden>{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="p-3 border-t border-border">
        <Link
          href="/api/auth/signout"
          className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-muted hover:text-[var(--color-text)] transition-colors duration-150 w-full"
        >
          <span aria-hidden>↩</span>
          התנתקות
        </Link>
      </div>
    </aside>
  )
}
