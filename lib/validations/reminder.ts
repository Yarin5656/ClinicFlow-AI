import { z } from "zod"

export const createReminderSchema = z.object({
  message: z
    .string()
    .min(2, "התזכורת חייבת להכיל לפחות 2 תווים")
    .max(200, "התזכורת ארוכה מדי"),
  scheduledAt: z
    .string()
    .min(1, "יש לבחור תאריך לתזכורת")
    .refine(
      (s) => !Number.isNaN(new Date(s).getTime()),
      "תאריך לא תקין"
    ),
  taskId: z.string().cuid("מזהה משימה לא תקין").nullable().optional(),
})

export type CreateReminderInput = z.infer<typeof createReminderSchema>

export const updateReminderSchema = z.object({
  seen: z.boolean().optional(),
})

export type UpdateReminderInput = z.infer<typeof updateReminderSchema>
