import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth"
import { ReminderBell } from "./ReminderBell"

interface HeaderProps {
  title: string
  subtitle?: string
}

export async function Header({ title, subtitle }: HeaderProps) {
  const session = await getServerSession(authOptions)
  const name = session?.user?.name ?? session?.user?.email ?? ""

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-border bg-surface-raised shrink-0">
      <div className="flex flex-col gap-0.5 min-w-0">
        <h1 className="text-xl font-display font-medium text-[var(--color-text)] leading-tight truncate">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-muted-foreground truncate">{subtitle}</p>
        )}
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <ReminderBell />
        {name && (
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium select-none">
              {name.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm text-muted-foreground hidden sm:block">
              {name}
            </span>
          </div>
        )}
      </div>
    </header>
  )
}
