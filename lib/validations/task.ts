import { z } from "zod"

export const taskStatusSchema = z.enum(["PENDING", "IN_PROGRESS", "DONE", "SKIPPED"])

export const updateTaskSchema = z.object({
  status: taskStatusSchema.optional(),
  notes: z.string().max(2000, "הערות ארוכות מדי").optional(),
})

export type UpdateTaskInput = z.infer<typeof updateTaskSchema>
