import type { OverallProgress } from "@/lib/tasks/aggregate"

interface Props {
  progress: OverallProgress
  targetCity?: string | null
  moveDate?: Date | null
}

export function OverallProgressBanner({ progress, targetCity, moveDate }: Props) {
  const daysUntilMove = moveDate
    ? Math.max(0, Math.ceil((moveDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null

  return (
    <div className="bg-primary text-primary-foreground rounded-xl p-6 shadow-card">
      <div className="flex items-start justify-between gap-6 flex-wrap">
        <div className="flex-1 min-w-[240px]">
          <div className="flex items-baseline gap-3 mb-2">
            <span className="font-display text-4xl font-bold tabular-nums">
              {progress.percentage}%
            </span>
            <span className="text-sm opacity-80">
              {progress.completed} מתוך {progress.total} משימות הושלמו
            </span>
          </div>
          <p className="text-sm opacity-90 leading-relaxed">
            {targetCity ? `המעבר שלך ל${targetCity}` : "המעבר שלך"}
            {daysUntilMove !== null && daysUntilMove > 0 && (
              <> בעוד <span className="font-semibold">{daysUntilMove}</span> ימים</>
            )}
            {daysUntilMove === 0 && <> היום</>}
          </p>
        </div>

        {/* Status counters */}
        <div className="flex gap-4 text-sm">
          {progress.inProgress > 0 && (
            <div className="flex flex-col items-start">
              <span className="text-xs opacity-70 font-medium">בתהליך</span>
              <span className="font-display text-xl font-semibold tabular-nums">
                {progress.inProgress}
              </span>
            </div>
          )}
          <div className="flex flex-col items-start">
            <span className="text-xs opacity-70 font-medium">ממתינות</span>
            <span className="font-display text-xl font-semibold tabular-nums">
              {progress.pending}
            </span>
          </div>
          <div className="flex flex-col items-start">
            <span className="text-xs opacity-70 font-medium">הושלמו</span>
            <span className="font-display text-xl font-semibold tabular-nums">
              {progress.completed}
            </span>
          </div>
        </div>
      </div>

      {/* Visual progress bar */}
      <div className="mt-5 h-1.5 w-full rounded-full bg-[oklch(35%_0.06_245)] overflow-hidden">
        <div
          className="h-full bg-[oklch(60%_0.15_200)] rounded-full transition-all duration-700 ease-out"
          style={{ width: `${progress.percentage}%` }}
          aria-hidden
        />
      </div>
    </div>
  )
}
