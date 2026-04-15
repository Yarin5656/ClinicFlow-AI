import { z } from "zod"
export const onboardingSchema = z.object({
  fromAddress: z.string().optional(),
  toAddress: z.string().min(1, "כתובת יעד נדרשת"),
  moveDate: z.string().min(1, "תאריך מעבר נדרש"),
  answers: z.object({
    moveDate: z.string(),
    targetCity: z.string().min(1),
    tenantType: z.enum(["renter", "owner"]),
    hasChildren: z.boolean(),
    hasCar: z.boolean(),
    employmentType: z.enum(["employee", "self-employed", "other"]),
  }),
})
