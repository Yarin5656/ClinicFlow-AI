import { z } from "zod"

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, "השם חייב להכיל לפחות 2 תווים")
    .max(80, "השם ארוך מדי"),
  email: z
    .string()
    .email("כתובת אימייל לא תקינה")
    .max(254, "האימייל ארוך מדי"),
  password: z
    .string()
    .min(8, "הסיסמה חייבת להיות לפחות 8 תווים")
    .max(100, "הסיסמה ארוכה מדי"),
})

export type RegisterInput = z.infer<typeof registerSchema>

export const loginSchema = z.object({
  email: z.string().email("כתובת אימייל לא תקינה"),
  password: z.string().min(1, "נא להזין סיסמה"),
})

export type LoginInput = z.infer<typeof loginSchema>
