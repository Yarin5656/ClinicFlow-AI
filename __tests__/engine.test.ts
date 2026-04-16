import { describe, it, expect } from "vitest"
import { matchesConditions, filterApplicableSteps } from "@/lib/workflows/engine"
import type { WizardAnswers, WorkflowStepDefinition } from "@/types"

const baseAnswers: WizardAnswers = {
  moveDate: "2026-05-01",
  targetCity: "תל אביב",
  tenantType: "renter",
  hasChildren: false,
  hasCar: false,
  employmentType: "employee",
}

describe("matchesConditions", () => {
  it("returns true when conditions are empty", () => {
    expect(matchesConditions({}, baseAnswers)).toBe(true)
  })

  it("returns true when conditions are undefined", () => {
    expect(matchesConditions(undefined, baseAnswers)).toBe(true)
  })

  it("returns true when every condition matches", () => {
    expect(matchesConditions({ tenantType: "renter" }, baseAnswers)).toBe(true)
    expect(matchesConditions({ hasChildren: false, hasCar: false }, baseAnswers)).toBe(true)
  })

  it("returns false when any condition fails (AND logic)", () => {
    expect(matchesConditions({ tenantType: "owner" }, baseAnswers)).toBe(false)
    expect(
      matchesConditions({ tenantType: "renter", hasChildren: true }, baseAnswers)
    ).toBe(false)
  })

  it("returns false when key is missing from answers", () => {
    expect(matchesConditions({ nonexistentKey: "anything" }, baseAnswers)).toBe(false)
  })
})

describe("filterApplicableSteps", () => {
  const steps: WorkflowStepDefinition[] = [
    { order: 1, title: "Always", description: "" },
    { order: 2, title: "Employees only", description: "", triggerConditions: { employmentType: "employee" } },
    { order: 3, title: "Self-employed only", description: "", triggerConditions: { employmentType: "self-employed" } },
    { order: 4, title: "Parents only", description: "", triggerConditions: { hasChildren: true } },
  ]

  it("returns only steps where conditions pass", () => {
    const employeeAnswers = { ...baseAnswers, employmentType: "employee" as const }
    const result = filterApplicableSteps(steps, employeeAnswers)
    expect(result.map((s) => s.order)).toEqual([1, 2])
  })

  it("filters correctly for self-employed", () => {
    const selfEmployed = { ...baseAnswers, employmentType: "self-employed" as const }
    const result = filterApplicableSteps(steps, selfEmployed)
    expect(result.map((s) => s.order)).toEqual([1, 3])
  })

  it("includes parent-only step when hasChildren is true", () => {
    const parent = { ...baseAnswers, hasChildren: true }
    const result = filterApplicableSteps(steps, parent)
    expect(result.map((s) => s.order)).toContain(4)
  })

  it("preserves step order in the output", () => {
    const result = filterApplicableSteps(steps, baseAnswers)
    const orders = result.map((s) => s.order)
    expect(orders).toEqual([...orders].sort((a, b) => a - b))
  })
})
