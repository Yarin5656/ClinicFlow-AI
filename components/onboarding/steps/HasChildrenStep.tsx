"use client"

import { ChoiceStep } from "./ChoiceStep"

interface Props {
  value: unknown
  onChange: (value: unknown) => void
  onNext: () => void
}

export function HasChildrenStep({ value, onChange, onNext }: Props) {
  return (
    <ChoiceStep<boolean>
      title="יש ילדים שיעברו איתך?"
      subtitle="נוסיף משימות לרישום למסגרות חינוך ושירותי רווחה"
      value={value}
      options={[
        { value: true, label: "כן, יש ילדים", description: "נוסיף משימות של רישום לגנים/בתי ספר" },
        { value: false, label: "לא" },
      ]}
      onChange={onChange}
      onNext={onNext}
      autoAdvance
    />
  )
}
