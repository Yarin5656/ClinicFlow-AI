/**
 * Illustrated "dashboard preview" for the landing hero.
 * Pure SVG-ish HTML, no external image assets.
 * Inspired by LoFrayer's phone mockup approach.
 */
export function HeroMockup() {
  return (
    <div className="relative w-full max-w-[440px] mx-auto lg:mr-0">
      <div className="relative rounded-2xl bg-surface-raised border border-border shadow-card p-5 aspect-[5/6] overflow-hidden">
        {/* Fake app header */}
        <div className="flex items-center gap-2 mb-4">
          <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-[10px] font-bold">
            י
          </div>
          <div className="flex flex-col gap-0.5">
            <div className="h-2 w-20 rounded-full bg-muted" />
            <div className="h-1.5 w-14 rounded-full bg-muted opacity-60" />
          </div>
        </div>

        {/* Progress banner */}
        <div className="rounded-lg bg-primary text-primary-foreground p-3 mb-3">
          <div className="flex items-baseline justify-between mb-2">
            <div className="flex items-baseline gap-1.5">
              <span className="font-display text-2xl font-bold">45%</span>
              <span className="text-[10px] opacity-80">הושלמו</span>
            </div>
            <div className="text-[10px] opacity-80">בעוד 12 ימים</div>
          </div>
          <div className="h-1 rounded-full bg-[oklch(35%_0.06_245)] overflow-hidden">
            <div className="h-full w-[45%] bg-highlight rounded-full" />
          </div>
        </div>

        {/* Workflow cards stack */}
        <div className="flex flex-col gap-2">
          {[
            { icon: "🏛️", title: "שינוי כתובת", pct: 60, badge: "בתהליך" },
            { icon: "🏙️", title: "ארנונה עירונית", pct: 25, badge: null },
            { icon: "💰", title: "רשות המסים", pct: 100, badge: "הושלם" },
          ].map((w, i) => (
            <div
              key={i}
              className="rounded-md bg-surface border border-border p-2.5"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <div className="h-7 w-7 rounded-md bg-[var(--color-pending-surface)] flex items-center justify-center text-sm">
                  {w.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-medium text-[var(--color-text)] truncate">
                    {w.title}
                  </div>
                </div>
                {w.badge && (
                  <span
                    className={
                      w.badge === "הושלם"
                        ? "text-[9px] px-1.5 py-0.5 rounded bg-highlight-soft text-[var(--color-highlight)]"
                        : "text-[9px] px-1.5 py-0.5 rounded bg-[var(--color-warning-surface)] text-[var(--color-warning)]"
                    }
                  >
                    {w.badge}
                  </span>
                )}
              </div>
              <div className="h-1 rounded-full bg-muted overflow-hidden">
                <div
                  className={
                    w.pct === 100
                      ? "h-full bg-highlight rounded-full"
                      : "h-full bg-accent rounded-full"
                  }
                  style={{ width: `${w.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Floating badge */}
        <div className="absolute -bottom-3 -left-3 bg-highlight text-highlight-foreground rounded-lg px-3 py-1.5 shadow-card flex items-center gap-1.5 text-xs font-semibold rotate-[-4deg]">
          <span aria-hidden>✓</span>
          <span>10 מתוך 11 הושלמו</span>
        </div>
      </div>

      {/* Background accent */}
      <div
        aria-hidden
        className="absolute -z-10 inset-0 translate-x-4 translate-y-4 rounded-2xl bg-highlight-soft"
      />
    </div>
  )
}
