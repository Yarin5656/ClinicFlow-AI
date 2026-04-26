import { z } from "zod"

export const OPTIONAL_FIELDS = ["treatment", "source", "message", "preferredDate"] as const
export type OptionalField = (typeof OPTIONAL_FIELDS)[number]

export const leadFormConfigSchema = z.object({
  title: z.string().min(1, "כותרת חובה").max(100),
  subtitle: z.string().max(200).optional().default(""),
  fields: z.array(z.enum(OPTIONAL_FIELDS)).default([]),
  active: z.boolean().default(false),
})

export const saveLeadFormSchema = z.object({
  slug: z
    .string()
    .min(3, "מינימום 3 תווים")
    .max(40, "מקסימום 40 תווים")
    .regex(/^[a-z0-9-]+$/, "רק אותיות קטנות באנגלית, מספרים ומקפים"),
  config: leadFormConfigSchema,
})

export const publicSubmitSchema = z.object({
  name: z.string().min(2, "שם חובה"),
  phone: z.string().min(7, "טלפון חובה"),
  serviceId: z.string().optional(),
  treatment: z.string().max(200).optional(),
  source: z.string().max(100).optional(),
  message: z.string().max(1000).optional(),
  preferredDate: z.string().optional(),
  answers: z.record(z.string(), z.unknown()).default({}),
})

export type LeadFormConfig = z.infer<typeof leadFormConfigSchema>
export type SaveLeadFormInput = z.infer<typeof saveLeadFormSchema>
export type PublicSubmitInput = z.infer<typeof publicSubmitSchema>
