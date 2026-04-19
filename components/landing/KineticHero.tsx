"use client"

import Link from "next/link"
import { motion, useReducedMotion } from "motion/react"

const spring = { type: "spring" as const, stiffness: 120, damping: 16 }
const softSpring = { type: "spring" as const, stiffness: 80, damping: 14 }

export function KineticHero() {
  const reduced = useReducedMotion()

  const containerVariants = {
    hidden: {},
    visible: {
      transition: reduced ? { duration: 0 } : { staggerChildren: 0.08, delayChildren: 0.1 },
    },
  }

  const wordUp = {
    hidden: { opacity: 0, y: reduced ? 0 : 32, filter: reduced ? "none" : "blur(8px)" },
    visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: reduced ? { duration: 0 } : spring },
  }

  const popIn = {
    hidden: { opacity: 0, scale: reduced ? 1 : 0.6 },
    visible: { opacity: 1, scale: 1, transition: reduced ? { duration: 0 } : { ...spring, stiffness: 180 } },
  }

  return (
    <section className="relative overflow-hidden">
      {/* Ambient background gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 70% 20%, oklch(94% 0.04 150 / 0.5), transparent 60%), " +
            "radial-gradient(ellipse at 10% 80%, oklch(94% 0.025 245 / 0.6), transparent 60%)",
        }}
        aria-hidden
      />

      <div className="relative max-w-6xl mx-auto px-6 py-16 lg:py-28 grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
        {/* Copy column */}
        <motion.div initial="hidden" animate="visible" variants={containerVariants}>
          {/* Pill */}
          <motion.div variants={popIn} className="inline-flex">
            <span className="inline-flex items-center gap-2 rounded-full bg-highlight-soft text-[var(--color-highlight)] px-3 py-1 text-xs font-semibold mb-6 border border-[var(--color-highlight)]/20">
              <motion.span
                aria-hidden
                animate={reduced ? {} : { rotate: [0, 12, -8, 0] }}
                transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 4 }}
              >
                ✦
              </motion.span>
              מעבר דירה מסודר, בלי הטרטור
            </span>
          </motion.div>

          {/* Headline — word-by-word reveal */}
          <h1 className="font-display text-4xl sm:text-5xl lg:text-[4.2rem] font-bold text-primary leading-[1.08] mb-6 tracking-tight">
            <motion.span variants={wordUp} className="inline-block">כל</motion.span>{" "}
            <motion.span variants={wordUp} className="inline-block">הביורוקרטיה</motion.span>{" "}
            <motion.span variants={wordUp} className="inline-block">של</motion.span>{" "}
            <motion.span variants={wordUp} className="inline-block">מעבר</motion.span>{" "}
            <motion.span variants={wordUp} className="inline-block">הדירה</motion.span>
            <br />
            <motion.span
              variants={wordUp}
              className="inline-block text-[var(--color-highlight)] relative"
            >
              במקום אחד
              {/* Hand-drawn underline */}
              <motion.svg
                viewBox="0 0 300 14"
                preserveAspectRatio="none"
                className="absolute -bottom-2 right-0 w-full h-3 text-[var(--color-highlight)]"
                aria-hidden
              >
                <motion.path
                  d="M2 8 Q 75 2, 150 8 T 298 6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={reduced ? { duration: 0 } : { duration: 0.9, delay: 0.9, ease: "easeOut" }}
                />
              </motion.svg>
            </motion.span>
            <motion.span variants={wordUp} className="inline-block">.</motion.span>
          </h1>

          {/* Subtitle */}
          <motion.p
            variants={wordUp}
            className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-lg"
          >
            משרד הפנים, ארנונה, רשות המסים, קופת חולים, בנקים —{" "}
            <span className="font-semibold text-[var(--color-text)]">רשימה אישית אחת</span>{" "}
            שיודעת בדיוק מה אתה צריך לעשות, מתי ולמי.
          </motion.p>

          {/* CTAs */}
          <motion.div variants={wordUp} className="flex items-center gap-3 flex-wrap mb-6">
            <motion.div
              whileHover={reduced ? {} : { scale: 1.03 }}
              whileTap={reduced ? {} : { scale: 0.97 }}
              transition={spring}
            >
              <Link
                href="/register"
                className="inline-flex items-center justify-center h-12 px-6 rounded-lg bg-[var(--color-highlight)] text-highlight-foreground font-semibold text-base shadow-card hover:bg-[var(--color-highlight-hover)] transition-colors"
              >
                התחל עכשיו — חינם
              </Link>
            </motion.div>
            <motion.div
              whileHover={reduced ? {} : { scale: 1.03 }}
              whileTap={reduced ? {} : { scale: 0.97 }}
              transition={spring}
            >
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center h-12 px-6 rounded-lg border-2 border-border bg-surface-raised text-[var(--color-text)] font-medium text-base hover:border-[var(--color-muted-fg)] transition-colors"
              >
                איך זה עובד?
              </a>
            </motion.div>
          </motion.div>

          {/* Checkmarks */}
          <motion.ul
            variants={containerVariants}
            className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground"
          >
            {["רשימה אישית לפי המצב שלך", "לינקים ישירים ל-gov.il", "אחסון מסמכים מאובטח"].map((t) => (
              <motion.li
                key={t}
                variants={popIn}
                className="flex items-center gap-1.5"
              >
                <span className="text-[var(--color-highlight)]" aria-hidden>✓</span>
                {t}
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>

        {/* Illustration column — moving truck scene */}
        <div className="relative aspect-[5/6] max-w-md mx-auto w-full lg:ml-auto lg:mr-0">
          <MovingScene reduced={!!reduced} />
        </div>
      </div>
    </section>
  )
}

/**
 * Animated SVG scene: a parked truck, stacked boxes that settle in with
 * staggered spring physics, and a floating checkmark badge. In RTL the
 * truck faces left (toward the destination).
 */
function MovingScene({ reduced }: { reduced: boolean }) {
  const boxSpring = { type: "spring" as const, stiffness: 200, damping: 18 }
  const wiggle = reduced
    ? undefined
    : { y: [0, -3, 0] as number[] }
  const wiggleTransition = reduced
    ? undefined
    : { duration: 2.4, repeat: Infinity, ease: "easeInOut" as const }

  return (
    <div className="relative h-full w-full">
      {/* Soft ground shadow */}
      <div
        className="absolute bottom-4 left-6 right-6 h-6 rounded-[50%] blur-md"
        style={{ background: "oklch(25% 0.05 245 / 0.15)" }}
        aria-hidden
      />

      {/* Background card */}
      <motion.div
        initial={reduced ? {} : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reduced ? { duration: 0 } : { ...softSpring, delay: 0.2 }}
        className="absolute inset-0 rounded-3xl overflow-hidden"
        style={{
          background:
            "linear-gradient(180deg, oklch(98% 0.004 245) 0%, oklch(94% 0.012 245) 100%)",
          border: "1px solid oklch(88% 0.015 245)",
        }}
      >
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.3]"
          style={{
            backgroundImage:
              "linear-gradient(oklch(88% 0.015 245) 1px, transparent 1px), linear-gradient(90deg, oklch(88% 0.015 245) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
          aria-hidden
        />
      </motion.div>

      {/* Truck — parked, gently rocking */}
      <motion.svg
        viewBox="0 0 200 100"
        className="absolute bottom-6 right-4 w-44 h-auto"
        initial={reduced ? { opacity: 1, x: 0 } : { opacity: 0, x: 60 }}
        animate={reduced ? { opacity: 1, x: 0 } : { opacity: 1, x: 0, ...wiggle }}
        transition={reduced ? { duration: 0 } : wiggleTransition}
        aria-hidden
      >
        {/* Truck body */}
        <rect x="10" y="30" width="80" height="45" rx="4" fill="oklch(25% 0.08 245)" />
        {/* Truck cab */}
        <path d="M 90 45 L 120 45 L 130 55 L 130 75 L 90 75 Z" fill="oklch(35% 0.08 245)" />
        {/* Windows */}
        <rect x="95" y="50" width="18" height="10" rx="1" fill="oklch(75% 0.05 210)" />
        {/* Wheels */}
        <circle cx="30" cy="78" r="9" fill="oklch(15% 0.02 245)" />
        <circle cx="30" cy="78" r="4" fill="oklch(50% 0.03 245)" />
        <circle cx="105" cy="78" r="9" fill="oklch(15% 0.02 245)" />
        <circle cx="105" cy="78" r="4" fill="oklch(50% 0.03 245)" />
        {/* Body panel lines */}
        <rect x="15" y="38" width="70" height="30" rx="2" fill="none" stroke="oklch(35% 0.08 245)" strokeWidth="0.8" />
        {/* Label */}
        <text x="50" y="56" textAnchor="middle" fill="oklch(97% 0.004 245)" fontSize="6" fontWeight="700">
          MoveEasy
        </text>
      </motion.svg>

      {/* Stacked boxes (right side of the truck = loading bay in RTL) */}
      <div className="absolute top-10 right-10 flex flex-col gap-2 items-end">
        {BOXES.map((b, i) => (
          <motion.div
            key={b.label}
            initial={reduced ? { opacity: 1, y: 0, rotate: 0 } : { opacity: 0, y: -80, rotate: b.rotate + 20 }}
            animate={{ opacity: 1, y: 0, rotate: b.rotate }}
            transition={reduced ? { duration: 0 } : { ...boxSpring, delay: 0.45 + i * 0.18 }}
            className="px-3 py-2 rounded-md text-xs font-medium shadow-card flex items-center gap-1.5"
            style={{ background: b.bg, color: b.fg, width: b.width }}
          >
            <span aria-hidden>{b.icon}</span>
            <span>{b.label}</span>
          </motion.div>
        ))}
      </div>

      {/* Floating completion badge */}
      <motion.div
        initial={reduced ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.2, rotate: -20 }}
        animate={{ opacity: 1, scale: 1, rotate: -8 }}
        transition={reduced ? { duration: 0 } : { ...boxSpring, delay: 1.4, stiffness: 260 }}
        className="absolute bottom-16 left-8 flex items-center gap-2 rounded-xl px-3 py-2 shadow-card"
        style={{
          background: "var(--color-highlight)",
          color: "var(--color-highlight-fg)",
        }}
      >
        <motion.span
          aria-hidden
          animate={reduced ? {} : { scale: [1, 1.3, 1] }}
          transition={{ duration: 0.5, delay: 1.8 }}
        >
          ✓
        </motion.span>
        <span className="text-xs font-bold">הכל מסודר</span>
      </motion.div>

      {/* Small orbiting dot for extra life */}
      {!reduced && (
        <motion.div
          className="absolute top-12 left-12 w-2 h-2 rounded-full"
          style={{ background: "var(--color-accent)" }}
          animate={{
            x: [0, 20, 0, -20, 0],
            y: [0, -15, -25, -15, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          aria-hidden
        />
      )}
    </div>
  )
}

const BOXES = [
  { label: "שינוי כתובת",  icon: "🏛️", bg: "oklch(97% 0.003 245)", fg: "oklch(25% 0.08 245)", rotate: -2, width: 130 },
  { label: "ארנונה",         icon: "🏙️", bg: "oklch(94% 0.04 200)",  fg: "oklch(35% 0.1 200)",  rotate: 3,  width: 110 },
  { label: "רשות המסים",    icon: "💰", bg: "oklch(94% 0.04 75)",   fg: "oklch(45% 0.12 75)",  rotate: -3, width: 130 },
  { label: "ביטוח לאומי",   icon: "📋", bg: "oklch(94% 0.03 150)",  fg: "oklch(45% 0.13 150)", rotate: 2,  width: 130 },
]
