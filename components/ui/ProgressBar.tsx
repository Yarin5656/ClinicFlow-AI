import { cn } from "@/lib/utils"

interface ProgressBarProps {
  value: number
  total?: number
  completed?: number
  className?: string
  size?: "sm" | "md"
  showLabel?: boolean
}

export function ProgressBar({ value, total, completed, className, size = "md", showLabel = true }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, value))
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {showLabel && total !== undefined && completed !== undefined && (
        <div className="flex justify-between items-center text-xs text-muted-foreground">
          <span>{completed} מתוך {total} הושלמו</span>
          <span className="font-medium text-[var(--color-text)]">{pct}%</span>
        </div>
      )}
      <div
        className={cn("w-full overflow-hidden rounded-full bg-muted", size === "sm" ? "h-1.5" : "h-2")}
        role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out",
            pct === 100 ? "bg-[var(--color-done)]" : pct > 0 ? "bg-accent" : "bg-muted"
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
