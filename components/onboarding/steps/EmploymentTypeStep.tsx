"use client"

import { ChoiceStep } from "./ChoiceStep"

interface Props {
  value: unknown
  onChange: (value: unknown) => void
  onNext: () => void
}

export function EmploymentTypeStep({ value, onChange, onNext }: Props) {
  return (
    <ChoiceStep<"employee" | "self-employed" | "other">
      title="מהו סטטוס התעסוקה שלך?"
      subtitle="קובע אילו עדכונים נדרשים ברשות המסים"
      value={value}
      options={[
        {
          value: "employee",
          label: "שכיר",
          description: "נוסיף משימה של עדכון כתובת אצל המעביד",
        },
        {
          value: "self-employed",
          label: "עצמאי / עוסק",
          description: "נוסיף משימה של עדכון כתובת במע״מ",
        },
        {
          value: "other",
          label: "אחר",
          description: "סטודנט, מובטל, פנסיונר או מצב אחר",
        },
      ]}
      onChange={onChange}
      onNext={onNext}
    />
  )
}
