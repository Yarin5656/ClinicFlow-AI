"use client"

import { ChoiceStep } from "./ChoiceStep"

interface Props {
  value: unknown
  onChange: (value: unknown) => void
  onNext: () => void
}

export function HasCarStep({ value, onChange, onNext }: Props) {
  return (
    <ChoiceStep<boolean>
      title="יש לך רכב?"
      subtitle="אם יש, נזכיר לך לעדכן כתובת ברישיון הנהיגה וברכב עצמו"
      value={value}
      options={[
        { value: true, label: "כן, יש רכב", description: "נדרש עדכון כתובת ברישיון תוך 30 יום" },
        { value: false, label: "אין לי רכב" },
      ]}
      onChange={onChange}
      onNext={onNext}
      autoAdvance
    />
  )
}
