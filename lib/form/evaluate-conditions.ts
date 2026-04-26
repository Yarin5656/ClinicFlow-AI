export type ConditionOperator = "eq" | "neq" | "contains"

export interface FieldCondition {
  fieldKey: string
  operator: ConditionOperator
  value: string
}

export function evaluateConditions(
  conditions: FieldCondition[] | null | undefined,
  formState: Record<string, unknown>
): boolean {
  if (!conditions || conditions.length === 0) return true
  return conditions.every(({ fieldKey, operator, value }) => {
    const current = String(formState[fieldKey] ?? "")
    if (operator === "eq") return current === value
    if (operator === "neq") return current !== value
    if (operator === "contains") return current.includes(value)
    return true
  })
}
