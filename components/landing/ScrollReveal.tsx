"use client"

import { motion, useReducedMotion, type Variants } from "motion/react"
import type { ReactNode } from "react"

interface Props {
  children: ReactNode
  /** Stagger reveal for direct children — only if they are also <ScrollRevealItem>. */
  stagger?: number
  className?: string
  as?: "section" | "div" | "article"
}

/**
 * Wraps a page section so its content reveals when scrolled into view.
 * Uses spring entrance + respects prefers-reduced-motion.
 */
export function ScrollReveal({ children, stagger = 0.08, className, as = "div" }: Props) {
  const reduced = useReducedMotion()
  const Component = motion[as]

  const parentVariants: Variants = {
    hidden: {},
    visible: {
      transition: reduced ? { duration: 0 } : { staggerChildren: stagger, delayChildren: 0.05 },
    },
  }

  return (
    <Component
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={parentVariants}
    >
      {children}
    </Component>
  )
}

interface ItemProps {
  children: ReactNode
  className?: string
  /** Distance in pixels to offset on hidden state. */
  distance?: number
}

export function ScrollRevealItem({ children, className, distance = 24 }: ItemProps) {
  const reduced = useReducedMotion()
  const variants: Variants = {
    hidden: { opacity: 0, y: reduced ? 0 : distance },
    visible: {
      opacity: 1,
      y: 0,
      transition: reduced
        ? { duration: 0 }
        : { type: "spring", stiffness: 100, damping: 18 },
    },
  }
  return (
    <motion.div variants={variants} className={className}>
      {children}
    </motion.div>
  )
}
