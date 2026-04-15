import { cn } from "@/lib/utils"
import type { TaskStatus } from "@/types"

const config: Record<TaskStatus, { label: string; className: string }> = {
  PENDING: { label: "ממתין", className: "bg-[var(--color-pending-surface)] text-[var(--color-pending)]" },
  IN_PROGRESS: { label: "בתהליך", className: "bg-[var(--color-warning-surface)] text-[var(--color-warning)]" },
  DONE: { label: "הושלם", className: "bg-[var(--color-done-surface)] text-[var(--color-done)]" },
  SKIPPED: { label: "דולג", className: "bg-muted text-muted-foreground" },
}

export function StatusBadge({ status, className }: { status: TaskStatus; className?: string }) {
  const { label, className: colorClass } = config[status]
  return (
    <span className={cn("inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium", colorClass, className)}>
      {label}
    </span>
  )
}
