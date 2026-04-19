import { cn } from "@/lib/utils"
import type { TaskStatus } from "@/types"

interface Props {
  status: TaskStatus
  size?: "sm" | "md"
  rotate?: number
  className?: string
}

const config: Record<TaskStatus, { label: string; color: string }> = {
  DONE:        { label: "אושר",   color: "oklch(50% 0.17 150)" },
  IN_PROGRESS: { label: "בטיפול", color: "oklch(60% 0.14 75)" },
  PENDING:     { label: "ממתין",   color: "oklch(52% 0.06 245)" },
  SKIPPED:     { label: "דולג",    color: "oklch(60% 0.02 245)" },
}

/**
 * Ink-stamp aesthetic for task statuses — a small nod to Israeli bureaucracy
 * made elegant. Used on completed tasks, reminders, etc.
 */
export function StatusStamp({ status, size = "sm", rotate = -8, className }: Props) {
  const { label, color } = config[status]
  const sz = size === "sm"
  return (
    <div
      className={cn(
        "inline-flex items-baseline gap-1.5 select-none",
        "border-[2.5px] rounded-md",
        sz ? "px-2 py-0.5 text-[11px]" : "px-3 py-1 text-sm",
        className
      )}
      style={{
        borderColor: color,
        color: color,
        background: `color-mix(in oklch, ${color} 8%, transparent)`,
        transform: `rotate(${rotate}deg)`,
      }}
      aria-label={`סטטוס: ${label}`}
    >
      <span className="font-display font-bold tracking-[0.08em]">{label}</span>
      {status === "DONE" && <span aria-hidden>✓</span>}
    </div>
  )
}
