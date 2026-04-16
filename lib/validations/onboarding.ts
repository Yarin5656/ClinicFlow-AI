import { z } from "zod"

export const wizardAnswersSchema = z.object({
  moveDate: z.string().min(1, "יש לבחור תאריך מעבר"),
  targetCity: z
    .string()
    .min(2, "שם העיר חייב להכיל לפחות 2 תווים")
    .max(80, "שם העיר ארוך מדי"),
  tenantType: z.enum(["renter", "owner"], { message: "יש לבחור בין שוכר לבעלים" }),
  hasChildren: z.boolean(),
  hasCar: z.boolean(),
  employmentType: z.enum(["employee", "self-employed", "other"], {
    message: "יש לבחור סוג תעסוקה",
  }),
})

export type WizardAnswersInput = z.infer<typeof wizardAnswersSchema>

export const onboardingSchema = z.object({
  fromAddress: z.string().max(200).optional(),
  toAddress: z.string().min(1, "כתובת יעד נדרשת").max(200),
  moveDate: z.string().min(1, "תאריך מעבר נדרש"),
  answers: wizardAnswersSchema,
})

export type OnboardingInput = z.infer<typeof onboardingSchema>
