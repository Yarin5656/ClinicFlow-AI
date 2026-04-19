"use client"

import { motion, useReducedMotion } from "motion/react"
import { AnimatedCounter } from "@/components/landing/AnimatedCounter"
import type { OverallProgress } from "@/lib/tasks/aggregate"

interface Props {
  progress: OverallProgress
  targetCity?: string | null
  moveDate?: Date | null
}

export function OverallProgressBanner({ progress, targetCity, moveDate }: Props) {
  const reduced = useReducedMotion()
  const daysUntilMove = moveDate
    ? Math.max(0, Math.ceil((moveDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null

  const spring = { type: "spring" as const, stiffness: 110, damping: 18 }

  return (
    <motion.div
      initial={reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduced ? { duration: 0 } : spring}
      className="relative overflow-hidden rounded-2xl p-6 lg:p-8 shadow-card text-primary-foreground"
      style={{
        background:
          "radial-gradient(ellipse at 20% 10%, oklch(40% 0.1 245), oklch(22% 0.07 245) 70%)",
      }}
    >
      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
        aria-hidden
      />

      <div className="relative flex items-start justify-between gap-6 flex-wrap">
        <div className="flex-1 min-w-[260px]">
          <div className="flex items-baseline gap-3 mb-2">
            <motion.span
              className="font-display text-5xl lg:text-6xl font-bold tabular-nums"
              style={{ color: "var(--color-highlight)" }}
              initial={reduced ? {} : { scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={reduced ? { duration: 0 } : { ...spring, stiffness: 220, delay: 0.15 }}
            >
              <AnimatedCounter value={progress.percentage} suffix="%" duration={1.2} />
            </motion.span>
            <span className="text-sm opacity-80">
              <AnimatedCounter value={progress.completed} duration={1.2} /> מתוך{" "}
              {progress.total} משימות הושלמו
            </span>
          </div>
          <p className="text-sm opacity-90 leading-relaxed">
            {targetCity ? `המעבר שלך ל${targetCity}` : "המעבר שלך"}
            {daysUntilMove !== null && daysUntilMove > 0 && (
              <>
                {" בעוד "}
                <span className="font-semibold">{daysUntilMove}</span> ימים
              </>
            )}
            {daysUntilMove === 0 && " היום"}
          </p>
        </div>

        {/* Status counters */}
        <div className="flex gap-5 text-sm">
          {progress.inProgress > 0 && (
            <CounterTile label="בתהליך" value={progress.inProgress} delay={0.3} reduced={!!reduced} />
          )}
          <CounterTile label="ממתינות" value={progress.pending} delay={0.35} reduced={!!reduced} />
          <CounterTile label="הושלמו" value={progress.completed} delay={0.4} reduced={!!reduced} />
        </div>
      </div>

      {/* Visual progress bar */}
      <div className="relative mt-6 h-2 w-full rounded-full bg-[oklch(35%_0.06_245)] overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: "var(--color-highlight)" }}
          initial={{ width: 0 }}
          animate={{ width: `${progress.percentage}%` }}
          transition={
            reduced
              ? { duration: 0 }
              : { duration: 1.1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }
          }
          aria-hidden
        />
        {/* Moving shine */}
        {!reduced && progress.percentage > 0 && (
          <motion.div
            className="absolute inset-y-0 w-24 pointer-events-none"
            style={{
              background:
                "linear-gradient(90deg, transparent, oklch(100% 0 0 / 0.35), transparent)",
            }}
            initial={{ x: "-100%" }}
            animate={{ x: "400%" }}
            transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }}
          />
        )}
      </div>
    </motion.div>
  )
}

function CounterTile({
  label,
  value,
  delay,
  reduced,
}: {
  label: string
  value: number
  delay: number
  reduced: boolean
}) {
  return (
    <motion.div
      className="flex flex-col items-start"
      initial={reduced ? {} : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 180, damping: 18, delay }}
    >
      <span className="text-xs opacity-70 font-medium">{label}</span>
      <span className="font-display text-2xl font-semibold tabular-nums">
        <AnimatedCounter value={value} duration={1} />
      </span>
    </motion.div>
  )
}
