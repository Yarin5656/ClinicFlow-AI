"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/Button"
import type { WizardAnswersInput } from "@/lib/validations/onboarding"

// Step components
import { MoveDateStep } from "./steps/MoveDateStep"
import { TargetCityStep } from "./steps/TargetCityStep"
import { TenantTypeStep } from "./steps/TenantTypeStep"
import { HasChildrenStep } from "./steps/HasChildrenStep"
import { HasCarStep } from "./steps/HasCarStep"
import { EmploymentTypeStep } from "./steps/EmploymentTypeStep"

type StepId =
  | "moveDate"
  | "targetCity"
  | "tenantType"
  | "hasChildren"
  | "hasCar"
  | "employmentType"

interface StepDef {
  id: StepId
  Component: React.ComponentType<{
    value: unknown
    onChange: (value: unknown) => void
    onNext: () => void
  }>
  /** Returns true if the current value is acceptable to advance. */
  canAdvance: (value: unknown) => boolean
}

const STEPS: StepDef[] = [
  { id: "moveDate",       Component: MoveDateStep,       canAdvance: (v) => typeof v === "string" && v.length > 0 },
  { id: "targetCity",     Component: TargetCityStep,     canAdvance: (v) => typeof v === "string" && v.trim().length >= 2 },
  { id: "tenantType",     Component: TenantTypeStep,     canAdvance: (v) => v === "renter" || v === "owner" },
  { id: "hasChildren",    Component: HasChildrenStep,    canAdvance: (v) => typeof v === "boolean" },
  { id: "hasCar",         Component: HasCarStep,         canAdvance: (v) => typeof v === "boolean" },
  { id: "employmentType", Component: EmploymentTypeStep, canAdvance: (v) => v === "employee" || v === "self-employed" || v === "other" },
]

type AnswersState = Partial<WizardAnswersInput>

export function WizardShell() {
  const router = useRouter()
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<AnswersState>({})
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const current = STEPS[index]
  const currentValue = answers[current.id]
  const canAdvance = current.canAdvance(currentValue)
  const isLast = index === STEPS.length - 1

  const updateAnswer = (value: unknown) => {
    setAnswers((prev) => ({ ...prev, [current.id]: value }))
  }

  const goBack = () => setIndex((i) => Math.max(0, i - 1))

  const goNext = async () => {
    if (!canAdvance) return
    if (!isLast) {
      setIndex((i) => i + 1)
      return
    }
    await submit()
  }

  const submit = async () => {
    setSubmitting(true)
    setServerError(null)

    const fullAnswers = answers as WizardAnswersInput
    const payload = {
      toAddress: `${fullAnswers.targetCity}`,
      moveDate: fullAnswers.moveDate,
      answers: fullAnswers,
    }

    const res = await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string }
      setServerError(body.error ?? "שגיאה בשמירת הנתונים. נסה שוב.")
      setSubmitting(false)
      return
    }

    router.push("/dashboard")
    router.refresh()
  }

  const StepComponent = current.Component

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      {/* Progress dots */}
      <header className="pt-10 pb-6 px-4">
        <div className="max-w-md mx-auto flex justify-center gap-2">
          {STEPS.map((step, i) => (
            <div
              key={step.id}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === index
                  ? "w-7 bg-accent"
                  : i < index
                  ? "w-2 bg-primary"
                  : "w-2 bg-[var(--color-border)]"
              }`}
              aria-hidden
            />
          ))}
        </div>
        <p className="text-center text-xs text-muted-foreground mt-3">
          צעד {index + 1} מתוך {STEPS.length}
        </p>
      </header>

      {/* Current step */}
      <div className="flex-1 flex items-start justify-center px-4 pb-12">
        <div
          key={current.id}
          className="w-full max-w-md animate-fade-in"
        >
          <StepComponent
            value={currentValue}
            onChange={updateAnswer}
            onNext={goNext}
          />

          {serverError && (
            <div
              role="alert"
              className="mt-6 rounded-md bg-[var(--color-warning-surface)] text-[var(--color-warning)] px-3 py-2 text-sm"
            >
              {serverError}
            </div>
          )}

          {/* Footer navigation */}
          <div className="mt-8 flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="ghost"
              size="md"
              onClick={goBack}
              disabled={index === 0 || submitting}
            >
              חזרה
            </Button>

            <Button
              type="button"
              size="lg"
              onClick={goNext}
              disabled={!canAdvance}
              loading={submitting}
            >
              {isLast ? "סיום ויצירת רשימת משימות" : "הבא"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
