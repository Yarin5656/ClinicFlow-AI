"use client"

import Link from "next/link"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"

export interface WorkflowCardData {
  slug: string
  title: string
  description: string
  totalTasks: number
  completedTasks: number
  inProgressTasks: number
  pendingTasks: number
  nextTaskTitle?: string | null
}

interface Props {
  data: WorkflowCardData
  icon?: string
  /** Delay (seconds) for entrance stagger */
  delay?: number
}

export function WorkflowCard({ data, icon = "📋", delay = 0 }: Props) {
  const pct = data.totalTasks > 0
    ? Math.round((data.completedTasks / data.totalTasks) * 100)
    : 0
  const isComplete = data.totalTasks > 0 && data.completedTasks === data.totalTasks
  const notStarted = data.completedTasks === 0 && data.inProgressTasks === 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 120, damping: 18, delay }}
      whileHover={{ y: -4 }}
      whileTap={{ y: 0, scale: 0.99 }}
      style={{ viewTransitionName: `workflow-${data.slug}` }}
    >
      <Link
        href={`/tasks?workflow=${data.slug}`}
        className={cn(
          "group relative block bg-surface-raised rounded-2xl p-6 overflow-hidden",
          "border border-border shadow-card",
          "hover:shadow-card-hover hover:border-[var(--color-highlight)]/40",
          "transition-[box-shadow,border-color] duration-200"
        )}
      >
        {/* Paper texture: tiny dot grid */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.4] pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, oklch(92% 0.012 245) 1px, transparent 0)",
            backgroundSize: "16px 16px",
          }}
        />

        {/* Header */}
        <div className="relative flex items-start gap-3 mb-5">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform duration-200"
            style={{ background: "var(--color-highlight-soft)" }}
            aria-hidden
          >
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-display text-xl font-bold text-[var(--color-text)] leading-tight mb-1">
              {data.title}
            </h3>
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {data.description}
            </p>
          </div>
        </div>

        {/* Progress section */}
        <div className="relative mb-5">
          <div className="flex items-baseline justify-between mb-2">
            <span className="font-display text-3xl font-bold tabular-nums"
              style={{ color: isComplete ? "var(--color-highlight)" : "var(--color-text)" }}
            >
              {data.completedTasks}
              <span className="text-muted-foreground text-lg font-normal">
                /{data.totalTasks}
              </span>
            </span>
            <span className="text-xs text-muted-foreground">משימות הושלמו</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${pct}%`,
                background: isComplete
                  ? "var(--color-highlight)"
                  : pct > 0
                    ? "var(--color-accent)"
                    : "transparent",
              }}
            />
          </div>
        </div>

        {/* Stamp on completed */}
        {isComplete && (
          <div
            className="absolute top-4 left-4 rotate-[-8deg] select-none pointer-events-none"
            aria-hidden
          >
            <div
              className="border-[2.5px] rounded-md px-2 py-0.5"
              style={{
                borderColor: "oklch(50% 0.17 150)",
                color: "oklch(50% 0.17 150)",
                background: "color-mix(in oklch, oklch(50% 0.17 150) 8%, transparent)",
              }}
            >
              <span className="font-display font-bold text-[11px] tracking-[0.08em]">אושר ✓</span>
            </div>
          </div>
        )}

        {/* Footer: next step or status */}
        <div className="relative pt-4 border-t border-[var(--color-border)] flex items-center justify-between gap-3">
          {notStarted && data.nextTaskTitle ? (
            <div className="flex-1 min-w-0">
              <div className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-semibold mb-0.5">
                ◉ המשימה הראשונה
              </div>
              <div className="text-sm text-[var(--color-text)] truncate font-medium">
                {data.nextTaskTitle}
              </div>
            </div>
          ) : data.inProgressTasks > 0 ? (
            <div className="flex items-center gap-1.5 text-sm text-[var(--color-warning)]">
              <span className="h-2 w-2 rounded-full bg-[var(--color-warning)] animate-pulse" aria-hidden />
              <span className="font-medium">
                {data.inProgressTasks} {data.inProgressTasks === 1 ? "משימה בתהליך" : "משימות בתהליך"}
              </span>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              {data.totalTasks} משימות סה״כ
            </div>
          )}

          <span
            className="shrink-0 inline-flex items-center gap-1 text-sm font-bold text-[var(--color-highlight)] group-hover:gap-2 transition-all"
            aria-hidden
          >
            כניסה
            <span className="transition-transform group-hover:-translate-x-1">←</span>
          </span>
        </div>
      </Link>
    </motion.div>
  )
}
