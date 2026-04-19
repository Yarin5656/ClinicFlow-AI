interface Milestone {
  /** Relative position 0–1 (0 = today, 1 = final deadline) */
  at: number
  label: string
  /** Is this milestone already in the past? */
  passed?: boolean
  /** Accent tone */
  tone?: "highlight" | "warning" | "muted"
}

interface Props {
  /** Days until the move */
  daysUntilMove: number
  /** Move date label (e.g. "15 במאי 2026") */
  moveDateLabel: string
}

/**
 * Horizontal timeline showing: today → move day → regulatory deadlines.
 * Appears in the dashboard hero to anchor the user in time.
 */
export function MoveTimeline({ daysUntilMove, moveDateLabel }: Props) {
  // Absolute positions on a 0-1 scale covering 90 days (-0 to +90 from today).
  // Move day sits at daysUntilMove / 90, capped at 0.5 for visual balance.
  const totalRangeDays = Math.max(90, daysUntilMove + 60)

  const milestones: Milestone[] = [
    { at: 0,                             label: "היום",          passed: true,  tone: "muted" },
    {
      at: Math.max(0.02, Math.min(0.5, daysUntilMove / totalRangeDays)),
      label: `המעבר · ${moveDateLabel}`,
      passed: daysUntilMove <= 0,
      tone: "highlight",
    },
    {
      at: Math.min(
        0.95,
        (daysUntilMove + 30) / totalRangeDays
      ),
      label: "דדליין 30 יום",
      tone: "warning",
    },
    {
      at: Math.min(
        0.99,
        (daysUntilMove + 60) / totalRangeDays
      ),
      label: "דדליין 60 יום",
      tone: "muted",
    },
  ]

  return (
    <div className="relative h-20 w-full max-w-[420px]">
      {/* Baseline */}
      <div
        className="absolute top-1/2 -translate-y-1/2 inset-x-2 h-[2px] rounded-full"
        style={{
          background:
            "linear-gradient(90deg, var(--color-highlight) 0%, oklch(52% 0.12 200) 50%, oklch(60% 0.14 75) 100%)",
          opacity: 0.35,
        }}
      />
      {milestones.map((m, i) => {
        const toneColor =
          m.tone === "highlight"
            ? "var(--color-highlight)"
            : m.tone === "warning"
              ? "var(--color-warning)"
              : "oklch(70% 0.03 245)"
        return (
          <div
            key={i}
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
            style={{ right: `${m.at * 100}%` }}
          >
            <div
              className="w-3.5 h-3.5 rounded-full border-2"
              style={{
                background: m.passed ? toneColor : "white",
                borderColor: toneColor,
              }}
              aria-hidden
            />
            <div
              className="absolute left-1/2 -translate-x-1/2 mt-2 whitespace-nowrap text-[10px] font-medium"
              style={{ color: toneColor, top: "100%" }}
            >
              {m.label}
            </div>
          </div>
        )
      })}
    </div>
  )
}
