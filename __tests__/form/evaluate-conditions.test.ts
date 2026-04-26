import { describe, it, expect } from "vitest"
import { evaluateConditions } from "@/lib/form/evaluate-conditions"

describe("evaluateConditions", () => {
  it("returns true when conditions is null", () => {
    expect(evaluateConditions(null, {})).toBe(true)
  })

  it("returns true when conditions is empty array", () => {
    expect(evaluateConditions([], {})).toBe(true)
  })

  it("eq: returns true when value matches", () => {
    expect(evaluateConditions(
      [{ fieldKey: "service_id", operator: "eq", value: "abc" }],
      { service_id: "abc" }
    )).toBe(true)
  })

  it("eq: returns false when value does not match", () => {
    expect(evaluateConditions(
      [{ fieldKey: "service_id", operator: "eq", value: "abc" }],
      { service_id: "xyz" }
    )).toBe(false)
  })

  it("neq: returns true when value differs", () => {
    expect(evaluateConditions(
      [{ fieldKey: "first_visit", operator: "neq", value: "no" }],
      { first_visit: "yes" }
    )).toBe(true)
  })

  it("contains: returns true when string includes value", () => {
    expect(evaluateConditions(
      [{ fieldKey: "notes", operator: "contains", value: "בוטוקס" }],
      { notes: "רוצה בוטוקס לפנים" }
    )).toBe(true)
  })

  it("multiple conditions: all must pass (AND logic)", () => {
    expect(evaluateConditions(
      [
        { fieldKey: "service_id", operator: "eq", value: "abc" },
        { fieldKey: "first_visit", operator: "eq", value: "yes" },
      ],
      { service_id: "abc", first_visit: "no" }
    )).toBe(false)
  })

  it("missing key in formState treated as empty string", () => {
    expect(evaluateConditions(
      [{ fieldKey: "service_id", operator: "eq", value: "" }],
      {}
    )).toBe(true)
  })
})
