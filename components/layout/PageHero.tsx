import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface PageHeroProps {
  /** Small uppercase kicker label above the title */
  eyebrow?: string
  /** Main title — can be a string or rich JSX for highlighting */
  title: ReactNode
  /** Optional subtitle / context line under the title */
  subtitle?: ReactNode
  /** Right-side slot — e.g. counters, badges, CTAs */
  right?: ReactNode
  /** Use the deep navy hero style (for marquee pages like dashboard) */
  variant?: "navy" | "light"
  className?: string
  /** Show the subtle dot-grid background (on by default) */
  showGrid?: boolean
}

/**
 * Unified page header used across app pages to give the product a single
 * visual voice. Replaces the old <Header> component on content pages.
 */
export function PageHero({
  eyebrow,
  title,
  subtitle,
  right,
  variant = "navy",
  className,
  showGrid = true,
}: PageHeroProps) {
  const isNavy = variant === "navy"
  return (
    <header
      className={cn(
        "relative overflow-hidden",
        isNavy ? "text-primary-foreground" : "text-[var(--color-text)]",
        className
      )}
      style={
        isNavy
          ? {
              background:
                "radial-gradient(ellipse at 15% 20%, oklch(42% 0.11 245), oklch(22% 0.07 245) 70%)",
            }
          : undefined
      }
    >
      {showGrid && isNavy && (
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      )}
      {showGrid && !isNavy && (
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.5] pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, oklch(88% 0.015 245) 1px, transparent 0)",
            backgroundSize: "18px 18px",
          }}
        />
      )}
      <div className="relative max-w-5xl mx-auto px-6 lg:px-8 py-8 lg:py-10">
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div className="flex-1 min-w-0">
            {eyebrow && (
              <div
                className={cn(
                  "inline-flex items-center text-[10px] uppercase tracking-[0.2em] font-bold mb-3",
                  isNavy
                    ? "text-[var(--color-highlight)]"
                    : "text-[var(--color-highlight)]"
                )}
              >
                {eyebrow}
              </div>
            )}
            <h1
              className={cn(
                "font-display font-bold tracking-tight leading-[1.1]",
                "text-3xl sm:text-4xl lg:text-[2.6rem]"
              )}
            >
              {title}
            </h1>
            {subtitle && (
              <div
                className={cn(
                  "mt-3 text-sm lg:text-base",
                  isNavy ? "opacity-85" : "text-muted-foreground"
                )}
              >
                {subtitle}
              </div>
            )}
          </div>
          {right && <div className="shrink-0">{right}</div>}
        </div>
      </div>
    </header>
  )
}

/**
 * Inline hand-drawn green underline under a phrase.
 * Usage:
 *   <PageHero title={<>כל <Underline>המעבר</Underline> שלך</>} />
 */
export function Underline({ children }: { children: ReactNode }) {
  return (
    <span className="relative inline-block whitespace-nowrap">
      {children}
      <svg
        viewBox="0 0 200 14"
        preserveAspectRatio="none"
        aria-hidden
        className="absolute -bottom-1 right-0 w-full h-2.5 text-[var(--color-highlight)]"
      >
        <path
          d="M2 8 Q 50 2, 100 8 T 198 6"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    </span>
  )
}
