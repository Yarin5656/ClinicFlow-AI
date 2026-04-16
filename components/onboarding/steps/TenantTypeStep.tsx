"use client"

import { ChoiceStep } from "./ChoiceStep"

interface Props {
  value: unknown
  onChange: (value: unknown) => void
  onNext: () => void
}

export function TenantTypeStep({ value, onChange, onNext }: Props) {
  return (
    <ChoiceStep<"renter" | "owner">
      title="שוכר או בעלים בדירה החדשה?"
      subtitle="משפיע על המסמכים שנצטרך לעדכון הכתובת ועל תהליך הארנונה"
      value={value}
      options={[
        {
          value: "renter",
          label: "שוכר",
          description: "חוזה שכירות בכתובת החדשה",
        },
        {
          value: "owner",
          label: "בעלים",
          description: "נסח טאבו / חוזה רכישה",
        },
      ]}
      onChange={onChange}
      onNext={onNext}
      autoAdvance
    />
  )
}
