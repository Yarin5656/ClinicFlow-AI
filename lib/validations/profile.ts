import { z } from "zod"

/** Israeli ID number: 9 digits; we also accept empty string for clearing. */
const idNumberField = z
  .string()
  .trim()
  .max(9, "מספר תעודת זהות חייב להכיל 9 ספרות")
  .regex(/^\d*$/, "רק ספרות")
  .optional()

/** Israeli phone: accept 9–13 chars (to cover 05X-XXXXXXX, 972-5X, etc.). */
const phoneField = z
  .string()
  .trim()
  .max(20, "מספר טלפון ארוך מדי")
  .optional()

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2, "השם חייב להכיל לפחות 2 תווים").max(80, "השם ארוך מדי").optional(),
  idNumber: idNumberField,
  phoneNumber: phoneField,
  birthDate: z
    .string()
    .optional()
    .refine(
      (s) => !s || !Number.isNaN(new Date(s).getTime()),
      "תאריך לא תקין"
    ),
})

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
