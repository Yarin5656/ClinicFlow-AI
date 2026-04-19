/**
 * MoveEasy hero illustration — a stylized relocation journey.
 * NOT a generic dashboard mockup: this is a route-map that shows the
 * move itself (from A to B), with the 3 workflows as checkpoints along
 * the path, and an Israeli-bureaucracy "approved stamp" moment.
 */
export function HeroMockup() {
  return (
    <div className="relative w-full max-w-[460px] mx-auto lg:mr-0">
      {/* Subtle accent shadow behind card */}
      <div
        aria-hidden
        className="absolute -z-10 inset-0 translate-x-5 translate-y-5 rounded-[28px] bg-highlight-soft"
      />

      <div
        className="relative rounded-[28px] bg-surface-raised border border-border shadow-card p-6 pt-8 overflow-hidden"
        style={{ aspectRatio: "5 / 6" }}
      >
        {/* Map grid background — faint dotted grid */}
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, oklch(88% 0.015 245) 1px, transparent 0)",
            backgroundSize: "18px 18px",
          }}
          aria-hidden
        />

        {/* Top label: From address */}
        <div className="relative flex items-center justify-between text-[11px] mb-4">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-[var(--color-muted-fg)]" aria-hidden />
            <span>הדירה הקודמת</span>
          </div>
          <div className="text-muted-foreground font-mono text-[10px]">
            01 / 05 / 2026
          </div>
        </div>

        {/* SVG route diagram */}
        <div className="relative h-[68%]">
          <svg viewBox="0 0 320 360" className="absolute inset-0 w-full h-full" aria-hidden>
            {/* Old apartment icon */}
            <g transform="translate(36, 26)">
              <rect width="50" height="52" rx="4" fill="oklch(88% 0.015 245)" />
              <rect x="4" y="8" width="10" height="10" rx="1" fill="oklch(75% 0.02 245)" />
              <rect x="20" y="8" width="10" height="10" rx="1" fill="oklch(75% 0.02 245)" />
              <rect x="36" y="8" width="10" height="10" rx="1" fill="oklch(75% 0.02 245)" />
              <rect x="4" y="24" width="10" height="10" rx="1" fill="oklch(75% 0.02 245)" />
              <rect x="20" y="24" width="10" height="10" rx="1" fill="oklch(75% 0.02 245)" />
              <rect x="36" y="24" width="10" height="10" rx="1" fill="oklch(75% 0.02 245)" />
              <rect x="18" y="40" width="14" height="12" rx="1" fill="oklch(92% 0.01 245)" />
            </g>

            {/* Dashed route path */}
            <path
              d="M 60 80 Q 130 110, 110 170 T 230 270 Q 240 300, 260 310"
              fill="none"
              stroke="oklch(60% 0.18 150)"
              strokeWidth="2.5"
              strokeDasharray="6 5"
              strokeLinecap="round"
            />

            {/* New apartment (destination) — slightly larger + highlight frame */}
            <g transform="translate(228, 290)">
              <rect x="-4" y="-4" width="68" height="74" rx="6" fill="oklch(94% 0.05 150)" />
              <rect width="60" height="66" rx="4" fill="oklch(25% 0.08 245)" />
              <rect x="5" y="8" width="10" height="10" rx="1" fill="oklch(65% 0.07 210)" />
              <rect x="25" y="8" width="10" height="10" rx="1" fill="oklch(65% 0.07 210)" />
              <rect x="45" y="8" width="10" height="10" rx="1" fill="oklch(65% 0.07 210)" />
              <rect x="5" y="24" width="10" height="10" rx="1" fill="oklch(65% 0.07 210)" />
              <rect x="25" y="24" width="10" height="10" rx="1" fill="oklch(65% 0.07 210)" />
              <rect x="45" y="24" width="10" height="10" rx="1" fill="oklch(65% 0.07 210)" />
              <rect x="5" y="40" width="10" height="10" rx="1" fill="oklch(65% 0.07 210)" />
              <rect x="25" y="40" width="10" height="10" rx="1" fill="oklch(65% 0.07 210)" />
              <rect x="45" y="40" width="10" height="10" rx="1" fill="oklch(65% 0.07 210)" />
              <rect x="22" y="54" width="16" height="12" rx="1" fill="oklch(94% 0.05 150)" />
            </g>

            {/* Destination pin with "חדשה" flag */}
            <g transform="translate(258, 275)">
              <path
                d="M 0 0 L 14 0 L 14 10 L 4 10 L 0 14 Z"
                fill="oklch(60% 0.18 150)"
              />
              <circle cx="-8" cy="0" r="3" fill="oklch(60% 0.18 150)" />
            </g>
          </svg>

          {/* Workflow chips — positioned along the route */}
          <div className="absolute top-[22%] right-[28%]">
            <WorkflowChip icon="🏛️" label="משרד הפנים" status="done" />
          </div>
          <div className="absolute top-[46%] right-[12%]">
            <WorkflowChip icon="🏙️" label="ארנונה" status="done" />
          </div>
          <div className="absolute top-[64%] right-[44%]">
            <WorkflowChip icon="💰" label="רשות המסים" status="progress" />
          </div>
        </div>

        {/* Bottom: destination address */}
        <div className="relative mt-2 pt-4 border-t border-border">
          <div className="flex items-center justify-between text-[11px] mb-2">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[var(--color-highlight)]" aria-hidden />
              <span className="font-medium text-[var(--color-text)]">
                הדירה החדשה · רמת גן
              </span>
            </div>
            <div className="text-muted-foreground">2 תהליכים הושלמו</div>
          </div>
        </div>

        {/* "אושר" official stamp — distinctive Israeli bureaucracy reference */}
        <div
          className="absolute bottom-12 left-3 rotate-[-12deg] select-none"
          aria-hidden
        >
          <div
            className="border-[3px] rounded-lg px-3 py-1.5"
            style={{
              borderColor: "oklch(55% 0.18 25)",
              color: "oklch(55% 0.18 25)",
              background: "oklch(98% 0.01 25 / 0.8)",
            }}
          >
            <div className="flex items-baseline gap-1.5">
              <span className="font-display font-bold text-base tracking-[0.08em]">
                אושר
              </span>
              <span className="text-[9px] font-mono opacity-70">
                10 / 05
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function WorkflowChip({
  icon,
  label,
  status,
}: {
  icon: string
  label: string
  status: "done" | "progress"
}) {
  const isDone = status === "done"
  return (
    <div
      className={`relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-semibold shadow-card ${
        isDone
          ? "bg-[var(--color-highlight)] text-[var(--color-highlight-fg)]"
          : "bg-[var(--color-warning-surface)] text-[var(--color-warning)] border border-[var(--color-warning)]/30"
      }`}
    >
      <span aria-hidden>{icon}</span>
      <span>{label}</span>
      {isDone && (
        <span
          className="flex items-center justify-center w-3.5 h-3.5 rounded-full bg-white text-[var(--color-highlight)] text-[9px]"
          aria-hidden
        >
          ✓
        </span>
      )}
    </div>
  )
}
