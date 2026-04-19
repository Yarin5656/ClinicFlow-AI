"use client"

import Link from "next/link"
import { motion } from "motion/react"
import { ProgressBar } from "@/components/ui/ProgressBar"
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
  accentColor?: "navy" | "teal" | "amber" | "green"
}

const accentStyles = {
  navy: { iconBg: "bg-[oklch(94%_0.02_245)]", iconFg: "text-[oklch(25%_0.08_245)]" },
  teal: { iconBg: "bg-[oklch(94%_0.03_200)]", iconFg: "text-[oklch(45%_0.13_200)]" },
  amber: { iconBg: "bg-[oklch(94%_0.04_75)]", iconFg: "text-[oklch(55%_0.14_75)]" },
  green: { iconBg: "bg-[oklch(94%_0.03_150)]", iconFg: "text-[oklch(45%_0.13_150)]" },
}

export function WorkflowCard({ data, icon = "📋", accentColor = "navy" }: Props) {
  const pct = data.totalTasks > 0 ? Math.round((data.completedTasks / data.totalTasks) * 100) : 0
  const isComplete = data.totalTasks > 0 && data.completedTasks === data.totalTasks
  const notStarted = data.completedTasks === 0 && data.inProgressTasks === 0
  const styles = accentStyles[accentColor]

  return (
    <motion.div
      whileHover={{ y: -3 }}
      whileTap={{ y: 0, scale: 0.99 }}
      transition={{ type: "spring", stiffness: 350, damping: 25 }}
      style={{ viewTransitionName: `workflow-${data.slug}` }}
    >
    <Link
      href={`/tasks?workflow=${data.slug}`}
      className={cn(
        "group block bg-surface-raised rounded-lg border border-border p-5",
        "shadow-card hover:shadow-card-hover hover:border-[var(--color-muted-fg)]",
        "transition-[box-shadow,border-color] duration-200"
      )}
    >
      {/* Header: icon + title + status pill */}
      <div className="flex items-start gap-3 mb-4">
        <div
          className={cn(
            "w-11 h-11 rounded-lg flex items-center justify-center text-xl shrink-0",
            styles.iconBg,
            styles.iconFg
          )}
          aria-hidden
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-lg font-medium text-[var(--color-text)] leading-tight mb-1">
            {data.title}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {data.description}
          </p>
        </div>
        {isComplete && (
          <span className="shrink-0 inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium bg-[var(--color-done-surface)] text-[var(--color-done)]">
            הושלם
          </span>
        )}
      </div>

      {/* Progress */}
      <ProgressBar
        value={pct}
        total={data.totalTasks}
        completed={data.completedTasks}
        size="md"
      />

      {/* Status summary or next action */}
      <div className="mt-4 pt-4 border-t border-[var(--color-border)] flex items-center justify-between gap-3">
        {notStarted && data.nextTaskTitle ? (
          <div className="flex-1 min-w-0">
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold mb-0.5">
              המשימה הראשונה
            </div>
            <div className="text-sm text-[var(--color-text)] truncate">
              {data.nextTaskTitle}
            </div>
          </div>
        ) : data.inProgressTasks > 0 ? (
          <div className="flex items-center gap-1.5 text-sm text-[var(--color-warning)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-warning)] animate-pulse" aria-hidden />
            {data.inProgressTasks} {data.inProgressTasks === 1 ? "משימה בתהליך" : "משימות בתהליך"}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">
            {data.totalTasks} {data.totalTasks === 1 ? "משימה" : "משימות"}
          </div>
        )}

        <span
          className="shrink-0 inline-flex items-center gap-1 text-sm font-medium text-accent group-hover:gap-2 transition-all"
          aria-hidden
        >
          כניסה
          <span className="transition-transform group-hover:-translate-x-0.5">←</span>
        </span>
      </div>
    </Link>
    </motion.div>
  )
}
