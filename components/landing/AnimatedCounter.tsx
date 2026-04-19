"use client"

import { animate, useInView, useMotionValue, useReducedMotion } from "motion/react"
import { useEffect, useRef, useState } from "react"

interface Props {
  value: number
  duration?: number
  suffix?: string
}

export function AnimatedCounter({ value, duration = 1.4, suffix = "" }: Props) {
  const reduced = useReducedMotion()
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.6 })
  const motionValue = useMotionValue(reduced ? value : 0)
  const [display, setDisplay] = useState(reduced ? value : 0)

  useEffect(() => {
    if (!inView || reduced) return
    const controls = animate(motionValue, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    })
    return () => controls.stop()
  }, [inView, value, duration, motionValue, reduced])

  return (
    <span ref={ref} className="tabular-nums">
      {display}
      {suffix}
    </span>
  )
}
