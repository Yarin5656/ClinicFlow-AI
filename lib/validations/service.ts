import { z } from "zod"

export const createServiceSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  categoryId: z.string().optional(),
  priceType: z.enum(["exact", "from", "hidden"]).default("hidden"),
  priceValue: z.number().int().min(0).optional(),
  durationMin: z.number().int().min(1).max(480).optional(),
  isActive: z.boolean().default(true),
  isBookable: z.boolean().default(false),
  staffId: z.string().optional(),
  locationId: z.string().optional(),
  displayOrder: z.number().int().default(0),
})

export const updateServiceSchema = createServiceSchema.partial()

export const createStaffSchema = z.object({
  name: z.string().min(1).max(100),
  role: z.string().max(100).optional(),
  isActive: z.boolean().default(true),
})

export const createLocationSchema = z.object({
  name: z.string().min(1).max(100),
  address: z.string().max(200).optional(),
  isActive: z.boolean().default(true),
})

export const fieldConditionSchema = z.object({
  fieldKey: z.string().min(1),
  operator: z.enum(["eq", "neq", "contains"]),
  value: z.string(),
})

export const fieldOptionSchema = z.object({
  label: z.string().min(1),
  value: z.string().min(1),
})

export const createFormFieldSchema = z.object({
  type: z.enum(["text", "textarea", "select", "radio", "checkbox", "number", "phone", "date"]),
  key: z.string().min(1).max(50).regex(/^[a-z0-9_]+$/, "key must be lowercase letters, numbers, underscores"),
  label: z.string().min(1).max(200),
  placeholder: z.string().max(200).optional(),
  isRequired: z.boolean().default(false),
  displayOrder: z.number().int().default(0),
  options: z.array(fieldOptionSchema).optional(),
  conditions: z.array(fieldConditionSchema).optional(),
})

export const updateFormFieldSchema = createFormFieldSchema.partial()

export const upsertFormTemplateSchema = z.object({
  title: z.string().min(1).max(100),
  subtitle: z.string().max(200).optional(),
  isActive: z.boolean().default(false),
})

export type CreateServiceInput = z.infer<typeof createServiceSchema>
export type CreateStaffInput = z.infer<typeof createStaffSchema>
export type CreateLocationInput = z.infer<typeof createLocationSchema>
export type CreateFormFieldInput = z.infer<typeof createFormFieldSchema>
export type UpsertFormTemplateInput = z.infer<typeof upsertFormTemplateSchema>
