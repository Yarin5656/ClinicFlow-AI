# Dynamic Form Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a configuration-driven form engine where each clinic defines services, form fields, and conditional rules — replacing the hardcoded `leadFormConfig` JSON with proper relational models.

**Architecture:** New Prisma models (Service, ServiceCategory, Location, StaffMember, FormTemplate, FormField) + admin CRUD pages under `/settings/*` + rewritten dynamic public form at `/f/[slug]`. Existing `/f/[slug]` route backward-compatible via fallback to old `leadFormConfig`.

**Tech Stack:** Next.js 14 App Router, Prisma (PostgreSQL), Zod, next-intl, Tailwind CSS, Vitest

---

## File Map

**New files:**
- `prisma/schema.prisma` — modified (new models + Lead fields)
- `lib/form/evaluate-conditions.ts` — pure conditional logic
- `__tests__/form/evaluate-conditions.test.ts` — unit tests
- `lib/validations/service.ts` — Zod schemas for service CRUD
- `app/api/services/route.ts` — GET list, POST create
- `app/api/services/[id]/route.ts` — PUT update, DELETE
- `app/api/staff/route.ts` — GET list, POST create
- `app/api/staff/[id]/route.ts` — PUT update, DELETE
- `app/api/locations/route.ts` — GET list, POST create
- `app/api/locations/[id]/route.ts` — PUT update, DELETE
- `app/api/form-template/route.ts` — GET template+fields, PUT upsert
- `app/api/form-template/fields/route.ts` — POST add field
- `app/api/form-template/fields/[id]/route.ts` — PUT update, DELETE
- `app/[locale]/(app)/settings/page.tsx` — settings hub
- `app/[locale]/(app)/settings/services/page.tsx` — services list
- `app/[locale]/(app)/settings/services/[id]/page.tsx` — edit service (handles "new" via id="new")
- `app/[locale]/(app)/settings/staff/page.tsx` — staff inline CRUD
- `app/[locale]/(app)/settings/locations/page.tsx` — locations inline CRUD
- `app/[locale]/(app)/settings/form/page.tsx` — form builder
- `components/settings/ServiceForm.tsx` — service add/edit form (client)
- `components/settings/StaffLocationsManager.tsx` — inline CRUD for staff/locations (client)
- `components/settings/FormBuilder.tsx` — field list + add modal (client)
- `components/f/DynamicField.tsx` — renders any FormField type
- `scripts/seed-demo-clinics.ts` — demo seed data

**Modified files:**
- `components/f/PublicLeadForm.tsx` — rewrite for dynamic fields
- `app/f/[slug]/page.tsx` — load FormTemplate, fallback to old config
- `app/api/public/lead-form/[slug]/route.ts` — accept serviceId + answers
- `lib/validations/lead-form.ts` — extend publicSubmitSchema
- `messages/he.json` — add translation keys

---

## Task 1: Prisma Schema — New Models

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Add new models to schema**

Replace the `// ─── ClinicFlow: Clients & Leads ─────────────────────────────────────` section and everything after with:

```prisma
// ─── ClinicFlow: Services ─────────────────────────────────────────

model ServiceCategory {
  id           String    @id @default(cuid())
  userId       String
  name         String
  displayOrder Int       @default(0)
  createdAt    DateTime  @default(now())

  user     User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  services Service[]

  @@index([userId])
}

model Service {
  id           String   @id @default(cuid())
  userId       String
  categoryId   String?
  name         String
  description  String?
  priceType    String   @default("hidden")
  priceValue   Int?
  durationMin  Int?
  isActive     Boolean  @default(true)
  isBookable   Boolean  @default(false)
  staffId      String?
  locationId   String?
  displayOrder Int      @default(0)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  user     User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  category ServiceCategory? @relation(fields: [categoryId], references: [id], onDelete: SetNull)
  staff    StaffMember?     @relation(fields: [staffId], references: [id], onDelete: SetNull)
  location Location?        @relation(fields: [locationId], references: [id], onDelete: SetNull)
  leads    Lead[]

  @@index([userId])
}

model Location {
  id        String   @id @default(cuid())
  userId    String
  name      String
  address   String?
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())

  user     User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  services Service[]

  @@index([userId])
}

model StaffMember {
  id        String   @id @default(cuid())
  userId    String
  name      String
  role      String?
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())

  user     User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  services Service[]

  @@index([userId])
}

model FormTemplate {
  id        String   @id @default(cuid())
  userId    String   @unique
  title     String
  subtitle  String?
  isActive  Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user   User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  fields FormField[]
}

model FormField {
  id           String   @id @default(cuid())
  templateId   String
  type         String
  key          String
  label        String
  placeholder  String?
  isRequired   Boolean  @default(false)
  isCore       Boolean  @default(false)
  displayOrder Int      @default(0)
  options      Json?
  conditions   Json?
  createdAt    DateTime @default(now())

  template FormTemplate @relation(fields: [templateId], references: [id], onDelete: Cascade)

  @@index([templateId])
}

// ─── ClinicFlow: Clients & Leads ─────────────────────────────────────

model Client {
  id              String   @id @default(cuid())
  userId          String
  name            String
  phone           String
  source          String?
  treatmentWanted String?
  notes           String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  user      User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  leads     Lead[]
  documents Document[]
  reminders Reminder[]

  @@index([userId])
}

model Lead {
  id          String   @id @default(cuid())
  clientId    String
  serviceId   String?
  status      String   @default("NEW")
  aiSummary   String?
  aiTags      String[]
  formAnswers Json?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  client  Client   @relation(fields: [clientId], references: [id], onDelete: Cascade)
  service Service? @relation(fields: [serviceId], references: [id], onDelete: SetNull)
  tasks   Task[]

  @@index([clientId])
}

// ─── Admin-editable Content ───────────────────────────────────────

model ContentBlock {
  id        String   @id @default(cuid())
  key       String   @unique
  value     String
  locale    String   @default("he")
  updatedAt DateTime @updatedAt
}
```

Also add relations to the `User` model (inside the existing User block, after `clients Client[]`):

```prisma
  serviceCategories ServiceCategory[]
  services          Service[]
  locations         Location[]
  staffMembers      StaffMember[]
  formTemplate      FormTemplate?
```

- [ ] **Step 2: Run migration**

```bash
npx prisma migrate dev --name dynamic_form_engine
```

Expected: migration file created, client regenerated, no errors.

- [ ] **Step 3: Verify types compile**

```bash
npx tsc --noEmit
```

Expected: no output (zero errors).

- [ ] **Step 4: Commit**

```bash
git add prisma/schema.prisma prisma/migrations/
git commit -m "feat(schema): add Service, FormTemplate, FormField, Location, StaffMember models"
```

---

## Task 2: Conditional Logic Engine + Tests

**Files:**
- Create: `lib/form/evaluate-conditions.ts`
- Create: `__tests__/form/evaluate-conditions.test.ts`

- [ ] **Step 1: Write failing tests**

Create `__tests__/form/evaluate-conditions.test.ts`:

```ts
import { describe, it, expect } from "vitest"
import { evaluateConditions } from "@/lib/form/evaluate-conditions"

describe("evaluateConditions", () => {
  it("returns true when conditions is null", () => {
    expect(evaluateConditions(null, {})).toBe(true)
  })

  it("returns true when conditions is empty array", () => {
    expect(evaluateConditions([], {})).toBe(true)
  })

  it("eq: returns true when value matches", () => {
    expect(evaluateConditions(
      [{ fieldKey: "service_id", operator: "eq", value: "abc" }],
      { service_id: "abc" }
    )).toBe(true)
  })

  it("eq: returns false when value does not match", () => {
    expect(evaluateConditions(
      [{ fieldKey: "service_id", operator: "eq", value: "abc" }],
      { service_id: "xyz" }
    )).toBe(false)
  })

  it("neq: returns true when value differs", () => {
    expect(evaluateConditions(
      [{ fieldKey: "first_visit", operator: "neq", value: "no" }],
      { first_visit: "yes" }
    )).toBe(true)
  })

  it("contains: returns true when string includes value", () => {
    expect(evaluateConditions(
      [{ fieldKey: "notes", operator: "contains", value: "בוטוקס" }],
      { notes: "רוצה בוטוקס לפנים" }
    )).toBe(true)
  })

  it("multiple conditions: all must pass (AND logic)", () => {
    expect(evaluateConditions(
      [
        { fieldKey: "service_id", operator: "eq", value: "abc" },
        { fieldKey: "first_visit", operator: "eq", value: "yes" },
      ],
      { service_id: "abc", first_visit: "no" }
    )).toBe(false)
  })

  it("missing key in formState treated as empty string", () => {
    expect(evaluateConditions(
      [{ fieldKey: "service_id", operator: "eq", value: "" }],
      {}
    )).toBe(true)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run __tests__/form/evaluate-conditions.test.ts
```

Expected: FAIL — "Cannot find module '@/lib/form/evaluate-conditions'"

- [ ] **Step 3: Implement**

Create `lib/form/evaluate-conditions.ts`:

```ts
export type ConditionOperator = "eq" | "neq" | "contains"

export interface FieldCondition {
  fieldKey: string
  operator: ConditionOperator
  value: string
}

export function evaluateConditions(
  conditions: FieldCondition[] | null | undefined,
  formState: Record<string, unknown>
): boolean {
  if (!conditions || conditions.length === 0) return true
  return conditions.every(({ fieldKey, operator, value }) => {
    const current = String(formState[fieldKey] ?? "")
    if (operator === "eq") return current === value
    if (operator === "neq") return current !== value
    if (operator === "contains") return current.includes(value)
    return true
  })
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run __tests__/form/evaluate-conditions.test.ts
```

Expected: 8 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/form/evaluate-conditions.ts __tests__/form/evaluate-conditions.test.ts
git commit -m "feat(form): add conditional logic engine with tests"
```

---

## Task 3: Validation Schemas

**Files:**
- Create: `lib/validations/service.ts`
- Modify: `lib/validations/lead-form.ts`

- [ ] **Step 1: Create service validation**

Create `lib/validations/service.ts`:

```ts
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
```

- [ ] **Step 2: Extend publicSubmitSchema**

In `lib/validations/lead-form.ts`, replace `publicSubmitSchema` with:

```ts
export const publicSubmitSchema = z.object({
  name: z.string().min(2, "שם חובה"),
  phone: z.string().min(7, "טלפון חובה"),
  serviceId: z.string().optional(),
  treatment: z.string().max(200).optional(),
  source: z.string().max(100).optional(),
  message: z.string().max(1000).optional(),
  preferredDate: z.string().optional(),
  answers: z.record(z.unknown()).default({}),
})

export type PublicSubmitInput = z.infer<typeof publicSubmitSchema>
```

- [ ] **Step 3: Verify compilation**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add lib/validations/service.ts lib/validations/lead-form.ts
git commit -m "feat(validation): add service, form-field, and extended lead-form schemas"
```

---

## Task 4: API — Services CRUD

**Files:**
- Create: `app/api/services/route.ts`
- Create: `app/api/services/[id]/route.ts`

- [ ] **Step 1: Create `app/api/services/route.ts`**

```ts
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth"
import { prisma } from "@/lib/db/prisma"
import { createServiceSchema } from "@/lib/validations/service"

export async function GET() {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const services = await prisma.service.findMany({
    where: { userId },
    include: {
      category: { select: { id: true, name: true } },
      staff: { select: { id: true, name: true } },
      location: { select: { id: true, name: true } },
    },
    orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
  })

  return NextResponse.json(services)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json().catch(() => null)
  const parsed = createServiceSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const service = await prisma.service.create({ data: { ...parsed.data, userId } })
  return NextResponse.json(service, { status: 201 })
}
```

- [ ] **Step 2: Create `app/api/services/[id]/route.ts`**

```ts
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth"
import { prisma } from "@/lib/db/prisma"
import { updateServiceSchema } from "@/lib/validations/service"

async function getOwnedService(userId: string, id: string) {
  return prisma.service.findFirst({ where: { id, userId } })
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const existing = await getOwnedService(userId, params.id)
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const body = await req.json().catch(() => null)
  const parsed = updateServiceSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const service = await prisma.service.update({ where: { id: params.id }, data: parsed.data })
  return NextResponse.json(service)
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const existing = await getOwnedService(userId, params.id)
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })

  await prisma.service.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 3: Commit**

```bash
git add app/api/services/
git commit -m "feat(api): add services CRUD endpoints"
```

---

## Task 5: API — Staff, Locations, FormTemplate

**Files:**
- Create: `app/api/staff/route.ts`
- Create: `app/api/staff/[id]/route.ts`
- Create: `app/api/locations/route.ts`
- Create: `app/api/locations/[id]/route.ts`
- Create: `app/api/form-template/route.ts`
- Create: `app/api/form-template/fields/route.ts`
- Create: `app/api/form-template/fields/[id]/route.ts`

- [ ] **Step 1: Create `app/api/staff/route.ts`**

```ts
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth"
import { prisma } from "@/lib/db/prisma"
import { createStaffSchema } from "@/lib/validations/service"

export async function GET() {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const staff = await prisma.staffMember.findMany({ where: { userId }, orderBy: { createdAt: "asc" } })
  return NextResponse.json(staff)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const body = await req.json().catch(() => null)
  const parsed = createStaffSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  const member = await prisma.staffMember.create({ data: { ...parsed.data, userId } })
  return NextResponse.json(member, { status: 201 })
}
```

- [ ] **Step 2: Create `app/api/staff/[id]/route.ts`**

```ts
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth"
import { prisma } from "@/lib/db/prisma"
import { createStaffSchema } from "@/lib/validations/service"

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const existing = await prisma.staffMember.findFirst({ where: { id: params.id, userId } })
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })
  const body = await req.json().catch(() => null)
  const parsed = createStaffSchema.partial().safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  const member = await prisma.staffMember.update({ where: { id: params.id }, data: parsed.data })
  return NextResponse.json(member)
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const existing = await prisma.staffMember.findFirst({ where: { id: params.id, userId } })
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })
  await prisma.staffMember.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 3: Create `app/api/locations/route.ts`**

```ts
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth"
import { prisma } from "@/lib/db/prisma"
import { createLocationSchema } from "@/lib/validations/service"

export async function GET() {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const locations = await prisma.location.findMany({ where: { userId }, orderBy: { createdAt: "asc" } })
  return NextResponse.json(locations)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const body = await req.json().catch(() => null)
  const parsed = createLocationSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  const location = await prisma.location.create({ data: { ...parsed.data, userId } })
  return NextResponse.json(location, { status: 201 })
}
```

- [ ] **Step 4: Create `app/api/locations/[id]/route.ts`**

```ts
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth"
import { prisma } from "@/lib/db/prisma"
import { createLocationSchema } from "@/lib/validations/service"

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const existing = await prisma.location.findFirst({ where: { id: params.id, userId } })
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })
  const body = await req.json().catch(() => null)
  const parsed = createLocationSchema.partial().safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  const location = await prisma.location.update({ where: { id: params.id }, data: parsed.data })
  return NextResponse.json(location)
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const existing = await prisma.location.findFirst({ where: { id: params.id, userId } })
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })
  await prisma.location.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 5: Create `app/api/form-template/route.ts`**

```ts
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth"
import { prisma } from "@/lib/db/prisma"
import { upsertFormTemplateSchema } from "@/lib/validations/service"

export async function GET() {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const template = await prisma.formTemplate.findUnique({
    where: { userId },
    include: { fields: { orderBy: { displayOrder: "asc" } } },
  })
  return NextResponse.json(template ?? null)
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json().catch(() => null)
  const parsed = upsertFormTemplateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const template = await prisma.formTemplate.upsert({
    where: { userId },
    create: { userId, ...parsed.data },
    update: parsed.data,
    include: { fields: { orderBy: { displayOrder: "asc" } } },
  })
  return NextResponse.json(template)
}
```

- [ ] **Step 6: Create `app/api/form-template/fields/route.ts`**

```ts
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth"
import { prisma } from "@/lib/db/prisma"
import { createFormFieldSchema } from "@/lib/validations/service"

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const template = await prisma.formTemplate.findUnique({ where: { userId } })
  if (!template) return NextResponse.json({ error: "Create a form template first" }, { status: 404 })

  const body = await req.json().catch(() => null)
  const parsed = createFormFieldSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const existing = await prisma.formField.findFirst({ where: { templateId: template.id, key: parsed.data.key } })
  if (existing) return NextResponse.json({ error: "Field key already exists" }, { status: 409 })

  const field = await prisma.formField.create({
    data: { templateId: template.id, ...parsed.data },
  })
  return NextResponse.json(field, { status: 201 })
}
```

- [ ] **Step 7: Create `app/api/form-template/fields/[id]/route.ts`**

```ts
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth"
import { prisma } from "@/lib/db/prisma"
import { updateFormFieldSchema } from "@/lib/validations/service"

async function getOwnedField(userId: string, fieldId: string) {
  return prisma.formField.findFirst({
    where: { id: fieldId, template: { userId } },
  })
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const existing = await getOwnedField(userId, params.id)
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (existing.isCore) return NextResponse.json({ error: "Core fields cannot be modified" }, { status: 403 })

  const body = await req.json().catch(() => null)
  const parsed = updateFormFieldSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const field = await prisma.formField.update({ where: { id: params.id }, data: parsed.data })
  return NextResponse.json(field)
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const existing = await getOwnedField(userId, params.id)
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (existing.isCore) return NextResponse.json({ error: "Core fields cannot be deleted" }, { status: 403 })

  await prisma.formField.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 8: Commit**

```bash
git add app/api/staff/ app/api/locations/ app/api/form-template/
git commit -m "feat(api): add staff, locations, form-template CRUD endpoints"
```

---

## Task 6: Update Public Submission API

**Files:**
- Modify: `app/api/public/lead-form/[slug]/route.ts`

- [ ] **Step 1: Update the POST handler**

Replace the entire `route.ts` with:

```ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { publicSubmitSchema, type LeadFormConfig } from "@/lib/validations/lead-form"
import { generateFollowUpTasksForLead } from "@/lib/workflows/leads"
import { sendLeadNotification } from "@/lib/email/sendLeadNotification"
import { checkRateLimit } from "@/lib/rateLimit"

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown"
  const { allowed } = checkRateLimit(`lead-form:${ip}`, 5, 10 * 60 * 1000)
  if (!allowed) return NextResponse.json({ error: "נסה שוב מאוחר יותר" }, { status: 429 })

  const user = await prisma.user.findUnique({
    where: { leadFormSlug: params.slug },
    select: {
      id: true, email: true, name: true, leadFormConfig: true,
      formTemplate: { select: { isActive: true, title: true } },
    },
  })
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const hasNewTemplate = user.formTemplate?.isActive
  const legacyConfig = user.leadFormConfig as LeadFormConfig | null
  if (!hasNewTemplate && !legacyConfig?.active) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: "בקשה לא תקינה" }, { status: 400 })
  }

  const parsed = publicSubmitSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "נתונים לא תקינים" }, { status: 400 })
  }

  const { name, phone, serviceId, treatment, source, message, answers } = parsed.data

  if (serviceId) {
    const service = await prisma.service.findFirst({ where: { id: serviceId, userId: user.id, isActive: true } })
    if (!service) return NextResponse.json({ error: "שירות לא נמצא" }, { status: 400 })
  }

  const { lead } = await prisma.$transaction(async (tx) => {
    const client = await tx.client.create({
      data: {
        userId: user.id,
        name,
        phone,
        source: source ?? "טופס אונליין",
        treatmentWanted: treatment,
        notes: message,
      },
    })
    const lead = await tx.lead.create({
      data: {
        clientId: client.id,
        status: "NEW",
        serviceId: serviceId ?? null,
        formAnswers: Object.keys(answers).length > 0 ? answers : undefined,
      },
    })
    return { client, lead }
  })

  try { await generateFollowUpTasksForLead(user.id, lead.id, "lead-intake") } catch (e) {
    console.error("[lead-form] workflow error", e)
  }

  const formTitle = user.formTemplate?.title ?? (legacyConfig?.title ?? "טופס")
  try {
    const baseUrl = process.env.NEXTAUTH_URL ?? "https://clinicflow-ai-xi.vercel.app"
    await sendLeadNotification({
      toEmail: user.email,
      clinicName: formTitle,
      clientName: name,
      phone,
      treatment,
      message,
      leadsUrl: `${baseUrl}/he/leads`,
    })
  } catch { /* best-effort */ }

  return NextResponse.json({ ok: true }, { status: 201 })
}
```

- [ ] **Step 2: Compile check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/api/public/lead-form/
git commit -m "feat(api): extend public lead-form submission to accept serviceId and formAnswers"
```

---

## Task 7: Dynamic Public Form Components

**Files:**
- Create: `components/f/DynamicField.tsx`
- Modify: `components/f/PublicLeadForm.tsx`
- Modify: `app/f/[slug]/page.tsx`

- [ ] **Step 1: Create `components/f/DynamicField.tsx`**

```tsx
"use client"

import type { FormField } from "@prisma/client"

const inputClass = "h-11 w-full rounded-xl border border-border bg-white/80 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-highlight)]"
const textareaClass = "w-full rounded-xl border border-border bg-white/80 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-highlight)] resize-none"

interface Props {
  field: FormField
  value: unknown
  onChange: (key: string, value: unknown) => void
}

type FieldOption = { label: string; value: string }

export function DynamicField({ field, value, onChange }: Props) {
  const options = (field.options as FieldOption[] | null) ?? []
  const strValue = String(value ?? "")

  const label = (
    <label className="text-sm font-medium text-[var(--color-text)]">
      {field.label}
      {field.isRequired && <span className="text-red-500 mr-1">*</span>}
    </label>
  )

  if (field.type === "textarea") {
    return (
      <div className="flex flex-col gap-1.5">
        {label}
        <textarea
          rows={3}
          required={field.isRequired}
          placeholder={field.placeholder ?? ""}
          className={textareaClass}
          value={strValue}
          onChange={e => onChange(field.key, e.target.value)}
        />
      </div>
    )
  }

  if (field.type === "select") {
    return (
      <div className="flex flex-col gap-1.5">
        {label}
        <select
          required={field.isRequired}
          className={inputClass}
          value={strValue}
          onChange={e => onChange(field.key, e.target.value)}
        >
          <option value="">{field.placeholder ?? "בחר..."}</option>
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
    )
  }

  if (field.type === "radio") {
    return (
      <div className="flex flex-col gap-2">
        {label}
        <div className="flex flex-col gap-1.5">
          {options.map(o => (
            <label key={o.value} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="radio"
                name={field.key}
                value={o.value}
                required={field.isRequired}
                checked={strValue === o.value}
                onChange={() => onChange(field.key, o.value)}
                className="accent-[var(--color-highlight)]"
              />
              {o.label}
            </label>
          ))}
        </div>
      </div>
    )
  }

  if (field.type === "checkbox") {
    const checked = Array.isArray(value) ? (value as string[]) : []
    return (
      <div className="flex flex-col gap-2">
        {label}
        <div className="flex flex-col gap-1.5">
          {options.map(o => (
            <label key={o.value} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                value={o.value}
                checked={checked.includes(o.value)}
                onChange={e => {
                  const next = e.target.checked
                    ? [...checked, o.value]
                    : checked.filter(v => v !== o.value)
                  onChange(field.key, next)
                }}
                className="accent-[var(--color-highlight)]"
              />
              {o.label}
            </label>
          ))}
        </div>
      </div>
    )
  }

  const inputType =
    field.type === "phone" ? "tel" :
    field.type === "number" ? "number" :
    field.type === "date" ? "date" : "text"

  return (
    <div className="flex flex-col gap-1.5">
      {label}
      <input
        type={inputType}
        required={field.isRequired}
        placeholder={field.placeholder ?? ""}
        className={inputClass}
        dir={field.type === "phone" ? "ltr" : undefined}
        value={strValue}
        onChange={e => onChange(field.key, e.target.value)}
      />
    </div>
  )
}
```

- [ ] **Step 2: Rewrite `components/f/PublicLeadForm.tsx`**

```tsx
"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import type { FormField } from "@prisma/client"
import { DynamicField } from "./DynamicField"
import { evaluateConditions, type FieldCondition } from "@/lib/form/evaluate-conditions"
import type { LeadFormConfig } from "@/lib/validations/lead-form"

interface Service {
  id: string
  name: string
  priceType: string
  priceValue: number | null
  durationMin: number | null
  description: string | null
}

interface DynamicFormProps {
  slug: string
  fields: FormField[]
  services: Service[]
  title?: string
}

interface LegacyFormProps {
  slug: string
  config: LeadFormConfig
}

type Props = DynamicFormProps | LegacyFormProps

function isDynamic(props: Props): props is DynamicFormProps {
  return "fields" in props
}

function formatPrice(priceType: string, priceValue: number | null): string | null {
  if (priceType === "hidden" || priceValue === null) return null
  const formatted = `₪${(priceValue / 100).toLocaleString("he-IL")}`
  return priceType === "from" ? `מ-${formatted}` : formatted
}

export function PublicLeadForm(props: Props) {
  const router = useRouter()
  const [formState, setFormState] = useState<Record<string, unknown>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  function setField(key: string, value: unknown) {
    setFormState(prev => ({ ...prev, [key]: value }))
  }

  // Legacy form (old leadFormConfig)
  if (!isDynamic(props)) {
    const { slug, config } = props
    return (
      <form onSubmit={async e => {
        e.preventDefault()
        setError("")
        setLoading(true)
        try {
          const body: Record<string, unknown> = {
            name: formState.name ?? "",
            phone: formState.phone ?? "",
            answers: {},
          }
          if (config.fields.includes("treatment") && formState.treatment) body.treatment = formState.treatment
          if (config.fields.includes("source") && formState.source) body.source = formState.source
          if (config.fields.includes("message") && formState.message) body.message = formState.message
          if (config.fields.includes("preferredDate") && formState.preferredDate) body.preferredDate = formState.preferredDate
          const res = await fetch(`/api/public/lead-form/${slug}`, {
            method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
          })
          if (res.status === 429) { setError("נסה שוב מאוחר יותר"); return }
          if (!res.ok) { setError("שגיאה בשליחה, נסה שוב"); return }
          router.push(`/f/${slug}/thanks`)
        } catch { setError("שגיאה בשליחה, נסה שוב") } finally { setLoading(false) }
      }} className="flex flex-col gap-4" dir="rtl">
        <LegacyFields config={config} formState={formState} setField={setField} />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <SubmitButton loading={loading} />
      </form>
    )
  }

  // Dynamic form
  const { slug, fields, services } = props

  const visibleFields = useMemo(() => {
    return fields.filter(f =>
      f.isCore || evaluateConditions(f.conditions as FieldCondition[] | null, formState)
    )
  }, [fields, formState])

  const hasServiceSelector = services.length > 0

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const answers: Record<string, unknown> = {}
      for (const f of visibleFields) {
        if (!f.isCore && f.key !== "name" && f.key !== "phone") {
          answers[f.key] = formState[f.key]
        }
      }
      const body = {
        name: formState.name ?? "",
        phone: formState.phone ?? "",
        serviceId: formState.service_id ?? undefined,
        answers,
      }
      const res = await fetch(`/api/public/lead-form/${slug}`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
      })
      if (res.status === 429) { setError("נסה שוב מאוחר יותר"); return }
      if (!res.ok) { setError("שגיאה בשליחה, נסה שוב"); return }
      router.push(`/f/${slug}/thanks`)
    } catch { setError("שגיאה בשליחה, נסה שוב") } finally { setLoading(false) }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4" dir="rtl">
      {/* Core: name */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">שם מלא <span className="text-red-500">*</span></label>
        <input
          required
          className="h-11 rounded-xl border border-border bg-white/80 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-highlight)]"
          placeholder="ישראל ישראלי"
          value={String(formState.name ?? "")}
          onChange={e => setField("name", e.target.value)}
        />
      </div>

      {/* Core: phone */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">טלפון <span className="text-red-500">*</span></label>
        <input
          required
          type="tel"
          dir="ltr"
          className="h-11 rounded-xl border border-border bg-white/80 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-highlight)]"
          placeholder="050-0000000"
          value={String(formState.phone ?? "")}
          onChange={e => setField("phone", e.target.value)}
        />
      </div>

      {/* Service selector */}
      {hasServiceSelector && (
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">טיפול מבוקש</label>
          <div className="flex flex-col gap-2">
            {services.map(s => {
              const price = formatPrice(s.priceType, s.priceValue)
              const selected = formState.service_id === s.id
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setField("service_id", selected ? "" : s.id)}
                  className="flex items-center justify-between px-4 py-3 rounded-xl border text-sm text-right transition-colors"
                  style={{
                    borderColor: selected ? "var(--color-highlight)" : "var(--color-border)",
                    background: selected ? "oklch(97% 0.02 10)" : "white",
                  }}
                >
                  <div>
                    <span className="font-medium">{s.name}</span>
                    {s.description && <p className="text-xs text-[var(--color-muted-fg)] mt-0.5">{s.description}</p>}
                  </div>
                  <div className="flex flex-col items-end gap-0.5 shrink-0 mr-2">
                    {price && <span className="text-xs font-semibold" style={{ color: "var(--color-highlight)" }}>{price}</span>}
                    {s.durationMin && <span className="text-xs text-[var(--color-muted-fg)]">{s.durationMin} דק׳</span>}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Dynamic fields */}
      {visibleFields
        .filter(f => !f.isCore)
        .map(f => (
          <DynamicField
            key={f.id}
            field={f}
            value={formState[f.key]}
            onChange={setField}
          />
        ))}

      {error && <p className="text-sm text-red-600">{error}</p>}
      <SubmitButton loading={loading} />
    </form>
  )
}

function SubmitButton({ loading }: { loading: boolean }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="h-12 rounded-xl font-semibold text-white text-base disabled:opacity-60 transition-all active:scale-[0.98]"
      style={{ background: "var(--color-highlight)" }}
    >
      {loading ? "שולח..." : "שלח פרטים"}
    </button>
  )
}

function LegacyFields({
  config, formState, setField,
}: { config: LeadFormConfig; formState: Record<string, unknown>; setField: (k: string, v: unknown) => void }) {
  const inputClass = "h-11 rounded-xl border border-border bg-white/80 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-highlight)]"
  return (
    <>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">שם מלא <span className="text-red-500">*</span></label>
        <input required className={inputClass} placeholder="ישראל ישראלי" value={String(formState.name ?? "")} onChange={e => setField("name", e.target.value)} />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">טלפון <span className="text-red-500">*</span></label>
        <input required type="tel" dir="ltr" className={inputClass} placeholder="050-0000000" value={String(formState.phone ?? "")} onChange={e => setField("phone", e.target.value)} />
      </div>
      {config.fields.includes("treatment") && (
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">טיפול מבוקש</label>
          <input className={inputClass} placeholder="בוטוקס, לייזר..." value={String(formState.treatment ?? "")} onChange={e => setField("treatment", e.target.value)} />
        </div>
      )}
      {config.fields.includes("message") && (
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">הודעה</label>
          <textarea rows={3} className="rounded-xl border border-border bg-white/80 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-highlight)] resize-none" value={String(formState.message ?? "")} onChange={e => setField("message", e.target.value)} />
        </div>
      )}
    </>
  )
}
```

- [ ] **Step 3: Update `app/f/[slug]/page.tsx`**

```tsx
import { cache } from "react"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/db/prisma"
import { PublicLeadForm } from "@/components/f/PublicLeadForm"
import type { LeadFormConfig } from "@/lib/validations/lead-form"

const getFormData = cache(async (slug: string) => {
  const user = await prisma.user.findUnique({
    where: { leadFormSlug: slug },
    select: {
      leadFormConfig: true,
      formTemplate: {
        include: { fields: { orderBy: { displayOrder: "asc" } } },
      },
      services: {
        where: { isActive: true },
        orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
        select: { id: true, name: true, description: true, priceType: true, priceValue: true, durationMin: true },
      },
    },
  })
  return user
})

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const data = await getFormData(params.slug)
  const title = data?.formTemplate?.title
    ?? (data?.leadFormConfig as LeadFormConfig | null)?.title
    ?? "השאר פרטים"
  return { title }
}

export default async function PublicFormPage({ params }: { params: { slug: string } }) {
  const data = await getFormData(params.slug)

  const template = data?.formTemplate
  const legacyConfig = data?.leadFormConfig as LeadFormConfig | null

  if (template?.isActive) {
    return <FormPageShell title={template.title} subtitle={template.subtitle ?? undefined}>
      <PublicLeadForm
        slug={params.slug}
        fields={template.fields}
        services={data?.services ?? []}
        title={template.title}
      />
    </FormPageShell>
  }

  if (legacyConfig?.active) {
    return <FormPageShell title={legacyConfig.title} subtitle={legacyConfig.subtitle}>
      <PublicLeadForm slug={params.slug} config={legacyConfig} />
    </FormPageShell>
  }

  notFound()
}

function FormPageShell({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <main
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: "linear-gradient(135deg, oklch(96% 0.03 245) 0%, oklch(98% 0.02 10) 100%)" }}
    >
      <div className="w-full max-w-md">
        <div className="text-center mb-8" dir="rtl">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[var(--color-highlight)] text-white text-2xl font-bold mb-4 shadow-lg">✦</div>
          <h1 className="font-display text-2xl font-bold text-[var(--color-text)] mb-2">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        <div className="bg-white rounded-2xl border border-border shadow-card p-6">{children}</div>
        <p className="text-center text-xs text-muted-foreground mt-6">
          מופעל על ידי{" "}
          <span className="font-semibold text-[var(--color-highlight)]">ClinicFlow AI</span>
        </p>
      </div>
    </main>
  )
}
```

- [ ] **Step 4: Compile check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add components/f/ app/f/[slug]/page.tsx
git commit -m "feat(form): rewrite PublicLeadForm with dynamic fields and service selector"
```

---

## Task 8: Admin Settings Pages

**Files:**
- Create: `app/[locale]/(app)/settings/page.tsx`
- Create: `app/[locale]/(app)/settings/services/page.tsx`
- Create: `app/[locale]/(app)/settings/services/[id]/page.tsx`
- Create: `app/[locale]/(app)/settings/staff/page.tsx`
- Create: `app/[locale]/(app)/settings/locations/page.tsx`
- Create: `app/[locale]/(app)/settings/form/page.tsx`
- Create: `components/settings/ServiceForm.tsx`
- Create: `components/settings/StaffLocationsManager.tsx`
- Create: `components/settings/FormBuilder.tsx`

- [ ] **Step 1: Create settings hub `app/[locale]/(app)/settings/page.tsx`**

```tsx
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth"
import { Link } from "@/lib/i18n/navigation"

export default async function SettingsPage({ params }: { params: { locale: string } }) {
  const session = await getServerSession(authOptions)
  if (!(session?.user as { id?: string } | undefined)?.id) redirect(`/${params.locale}/login`)

  const sections = [
    { href: "/settings/services", title: "שירותים", desc: "הגדר את רשימת הטיפולים שלך" },
    { href: "/settings/staff", title: "צוות", desc: "הוסף אנשי צוות לשיבוץ" },
    { href: "/settings/locations", title: "סניפים", desc: "נהל סניפים ומיקומים" },
    { href: "/settings/form", title: "טופס לידים", desc: "ערוך את הטופס הציבורי שלך" },
  ]

  return (
    <div className="p-6 lg:p-8 max-w-2xl" dir="rtl">
      <h1 className="font-display text-2xl font-bold text-[var(--color-text)] mb-6">הגדרות</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {sections.map(s => (
          <Link
            key={s.href}
            href={s.href}
            className="bg-surface-raised rounded-2xl border border-border p-5 shadow-card hover:bg-[var(--color-surface)] transition-colors"
          >
            <p className="font-semibold text-[var(--color-text)]">{s.title}</p>
            <p className="text-sm text-[var(--color-muted-fg)] mt-1">{s.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create `components/settings/ServiceForm.tsx`**

```tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface Staff { id: string; name: string }
interface Location { id: string; name: string }
interface Category { id: string; name: string }

interface Service {
  id?: string
  name: string
  description: string
  categoryId: string
  priceType: "exact" | "from" | "hidden"
  priceValue: string
  durationMin: string
  isActive: boolean
  isBookable: boolean
  staffId: string
  locationId: string
  displayOrder: string
}

interface Props {
  initial?: Partial<Service>
  staff: Staff[]
  locations: Location[]
  categories: Category[]
  locale: string
}

const inputClass = "h-10 w-full rounded-md border border-border bg-surface-raised px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
const labelClass = "text-sm font-medium text-[var(--color-text)]"

export function ServiceForm({ initial, staff, locations, categories, locale }: Props) {
  const router = useRouter()
  const [form, setForm] = useState<Service>({
    name: initial?.name ?? "",
    description: initial?.description ?? "",
    categoryId: initial?.categoryId ?? "",
    priceType: initial?.priceType ?? "hidden",
    priceValue: initial?.priceValue ?? "",
    durationMin: initial?.durationMin ?? "",
    isActive: initial?.isActive ?? true,
    isBookable: initial?.isBookable ?? false,
    staffId: initial?.staffId ?? "",
    locationId: initial?.locationId ?? "",
    displayOrder: initial?.displayOrder ?? "0",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const isEdit = Boolean(initial?.id)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const payload = {
        name: form.name,
        description: form.description || undefined,
        categoryId: form.categoryId || undefined,
        priceType: form.priceType,
        priceValue: form.priceValue ? Math.round(parseFloat(form.priceValue) * 100) : undefined,
        durationMin: form.durationMin ? parseInt(form.durationMin) : undefined,
        isActive: form.isActive,
        isBookable: form.isBookable,
        staffId: form.staffId || undefined,
        locationId: form.locationId || undefined,
        displayOrder: parseInt(form.displayOrder) || 0,
      }
      const url = isEdit ? `/api/services/${initial!.id}` : "/api/services"
      const method = isEdit ? "PUT" : "POST"
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      if (!res.ok) { setError("שגיאה בשמירה"); return }
      router.push(`/${locale}/settings/services`)
      router.refresh()
    } catch { setError("שגיאה בשמירה") } finally { setLoading(false) }
  }

  const set = (k: keyof Service, v: unknown) => setForm(f => ({ ...f, [k]: v }))

  return (
    <form onSubmit={submit} className="flex flex-col gap-4 max-w-lg" dir="rtl">
      <div className="flex flex-col gap-1.5">
        <label className={labelClass}>שם השירות <span className="text-red-500">*</span></label>
        <input required className={inputClass} value={form.name} onChange={e => set("name", e.target.value)} placeholder="בוטוקס פנים" />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelClass}>תיאור קצר</label>
        <input className={inputClass} value={form.description} onChange={e => set("description", e.target.value)} placeholder="תיאור קצר של הטיפול" />
      </div>

      {categories.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>קטגוריה</label>
          <select className={inputClass} value={form.categoryId} onChange={e => set("categoryId", e.target.value)}>
            <option value="">ללא קטגוריה</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>תמחור</label>
          <select className={inputClass} value={form.priceType} onChange={e => set("priceType", e.target.value as Service["priceType"])}>
            <option value="hidden">מוסתר</option>
            <option value="exact">מחיר מדויק</option>
            <option value="from">החל מ-</option>
          </select>
        </div>
        {form.priceType !== "hidden" && (
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>מחיר (₪)</label>
            <input type="number" min="0" step="0.01" className={inputClass} value={form.priceValue} onChange={e => set("priceValue", e.target.value)} placeholder="0" />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelClass}>משך טיפול (דקות)</label>
        <input type="number" min="1" className={inputClass} value={form.durationMin} onChange={e => set("durationMin", e.target.value)} placeholder="30" />
      </div>

      {staff.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>איש צוות</label>
          <select className={inputClass} value={form.staffId} onChange={e => set("staffId", e.target.value)}>
            <option value="">כל הצוות</option>
            {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
      )}

      {locations.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>סניף</label>
          <select className={inputClass} value={form.locationId} onChange={e => set("locationId", e.target.value)}>
            <option value="">כל הסניפים</option>
            {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
        </div>
      )}

      <div className="flex gap-4">
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={form.isActive} onChange={e => set("isActive", e.target.checked)} className="accent-[var(--color-highlight)]" />
          פעיל
        </label>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex gap-3">
        <button type="submit" disabled={loading} className="px-5 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-60" style={{ background: "var(--color-highlight)" }}>
          {loading ? "שומר..." : isEdit ? "עדכן שירות" : "הוסף שירות"}
        </button>
        <button type="button" onClick={() => router.back()} className="px-4 py-2 rounded-lg text-sm border border-border hover:bg-surface transition-colors">
          ביטול
        </button>
      </div>
    </form>
  )
}
```

- [ ] **Step 3: Create services list page `app/[locale]/(app)/settings/services/page.tsx`**

```tsx
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth"
import { prisma } from "@/lib/db/prisma"
import { Link } from "@/lib/i18n/navigation"
import { ServiceToggle } from "@/components/settings/ServiceToggle"

export default async function ServicesPage({ params }: { params: { locale: string } }) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId) redirect(`/${params.locale}/login`)

  const services = await prisma.service.findMany({
    where: { userId },
    include: { category: { select: { name: true } } },
    orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
  })

  return (
    <div className="p-6 lg:p-8 max-w-3xl" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-[var(--color-text)]">שירותים</h1>
        <Link href="/settings/services/new" className="px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: "var(--color-highlight)" }}>
          + הוסף שירות
        </Link>
      </div>

      {services.length === 0 ? (
        <div className="bg-surface-raised rounded-2xl border border-border p-10 text-center text-[var(--color-muted-fg)]">
          <p className="text-sm">עדיין לא הוספת שירותים.</p>
          <Link href="/settings/services/new" className="text-sm underline mt-2 inline-block" style={{ color: "var(--color-highlight)" }}>הוסף את הראשון</Link>
        </div>
      ) : (
        <div className="bg-surface-raised rounded-2xl border border-border divide-y divide-border">
          {services.map(s => (
            <div key={s.id} className="flex items-center justify-between px-4 py-3 gap-4">
              <div className="min-w-0">
                <p className="font-semibold text-sm text-[var(--color-text)] truncate">{s.name}</p>
                {s.category && <p className="text-xs text-[var(--color-muted-fg)]">{s.category.name}</p>}
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <ServiceToggle id={s.id} isActive={s.isActive} />
                <Link href={`/settings/services/${s.id}`} className="text-xs text-[var(--color-muted-fg)] hover:underline">ערוך</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Create `components/settings/ServiceToggle.tsx`** (client component for inline active toggle)

```tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export function ServiceToggle({ id, isActive }: { id: string; isActive: boolean }) {
  const [active, setActive] = useState(isActive)
  const router = useRouter()

  async function toggle() {
    const next = !active
    setActive(next)
    await fetch(`/api/services/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: next }),
    })
    router.refresh()
  }

  return (
    <button
      onClick={toggle}
      className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors"
      style={{ background: active ? "var(--color-highlight)" : "var(--color-border)" }}
      title={active ? "השבת" : "הפעל"}
    >
      <span
        className="inline-block h-4 w-4 rounded-full bg-white shadow transition-transform"
        style={{ transform: active ? "translateX(18px)" : "translateX(2px)" }}
      />
    </button>
  )
}
```

- [ ] **Step 5: Create service new/edit page `app/[locale]/(app)/settings/services/[id]/page.tsx`**

```tsx
import { redirect, notFound } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth"
import { prisma } from "@/lib/db/prisma"
import { ServiceForm } from "@/components/settings/ServiceForm"

export default async function ServiceEditPage({
  params,
}: { params: { locale: string; id: string } }) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId) redirect(`/${params.locale}/login`)

  const isNew = params.id === "new"
  const [staff, locations, categories, existing] = await Promise.all([
    prisma.staffMember.findMany({ where: { userId, isActive: true }, orderBy: { createdAt: "asc" } }),
    prisma.location.findMany({ where: { userId, isActive: true }, orderBy: { createdAt: "asc" } }),
    prisma.serviceCategory.findMany({ where: { userId }, orderBy: { displayOrder: "asc" } }),
    isNew ? null : prisma.service.findFirst({ where: { id: params.id, userId } }),
  ])

  if (!isNew && !existing) notFound()

  const initial = existing ? {
    id: existing.id,
    name: existing.name,
    description: existing.description ?? "",
    categoryId: existing.categoryId ?? "",
    priceType: existing.priceType as "exact" | "from" | "hidden",
    priceValue: existing.priceValue != null ? String(existing.priceValue / 100) : "",
    durationMin: existing.durationMin != null ? String(existing.durationMin) : "",
    isActive: existing.isActive,
    isBookable: existing.isBookable,
    staffId: existing.staffId ?? "",
    locationId: existing.locationId ?? "",
    displayOrder: String(existing.displayOrder),
  } : undefined

  return (
    <div className="p-6 lg:p-8" dir="rtl">
      <h1 className="font-display text-2xl font-bold text-[var(--color-text)] mb-6">
        {isNew ? "שירות חדש" : "עריכת שירות"}
      </h1>
      <ServiceForm
        initial={initial}
        staff={staff}
        locations={locations}
        categories={categories}
        locale={params.locale}
      />
    </div>
  )
}
```

- [ ] **Step 6: Create `components/settings/StaffLocationsManager.tsx`**

```tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface Item { id: string; name: string; role?: string | null; address?: string | null; isActive: boolean }
interface Props {
  items: Item[]
  endpoint: string
  nameLabel: string
  secondaryLabel?: string
  secondaryKey?: "role" | "address"
}

const inputClass = "h-9 rounded-md border border-border bg-surface-raised px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"

export function StaffLocationsManager({ items, endpoint, nameLabel, secondaryLabel, secondaryKey }: Props) {
  const router = useRouter()
  const [name, setName] = useState("")
  const [secondary, setSecondary] = useState("")
  const [loading, setLoading] = useState(false)

  async function add() {
    if (!name.trim()) return
    setLoading(true)
    const body: Record<string, string> = { name }
    if (secondaryKey && secondary) body[secondaryKey] = secondary
    await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
    setName("")
    setSecondary("")
    setLoading(false)
    router.refresh()
  }

  async function remove(id: string) {
    await fetch(`${endpoint}/${id}`, { method: "DELETE" })
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <input className={inputClass} placeholder={nameLabel} value={name} onChange={e => setName(e.target.value)} />
        {secondaryLabel && (
          <input className={inputClass} placeholder={secondaryLabel} value={secondary} onChange={e => setSecondary(e.target.value)} />
        )}
        <button onClick={add} disabled={loading || !name.trim()} className="px-4 py-1.5 rounded-lg text-sm font-semibold text-white disabled:opacity-50" style={{ background: "var(--color-highlight)" }}>
          הוסף
        </button>
      </div>

      {items.length > 0 && (
        <div className="bg-surface-raised rounded-xl border border-border divide-y divide-border">
          {items.map(item => (
            <div key={item.id} className="flex items-center justify-between px-4 py-2.5 gap-4">
              <div>
                <p className="text-sm font-medium text-[var(--color-text)]">{item.name}</p>
                {secondaryKey && item[secondaryKey] && (
                  <p className="text-xs text-[var(--color-muted-fg)]">{item[secondaryKey]}</p>
                )}
              </div>
              <button onClick={() => remove(item.id)} className="text-xs text-red-400 hover:text-red-600 transition-colors">הסר</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 7: Create `app/[locale]/(app)/settings/staff/page.tsx`**

```tsx
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth"
import { prisma } from "@/lib/db/prisma"
import { StaffLocationsManager } from "@/components/settings/StaffLocationsManager"

export default async function StaffPage({ params }: { params: { locale: string } }) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId) redirect(`/${params.locale}/login`)
  const staff = await prisma.staffMember.findMany({ where: { userId }, orderBy: { createdAt: "asc" } })

  return (
    <div className="p-6 lg:p-8 max-w-xl" dir="rtl">
      <h1 className="font-display text-2xl font-bold text-[var(--color-text)] mb-6">צוות</h1>
      <StaffLocationsManager
        items={staff}
        endpoint="/api/staff"
        nameLabel="שם איש צוות"
        secondaryLabel="תפקיד"
        secondaryKey="role"
      />
    </div>
  )
}
```

- [ ] **Step 8: Create `app/[locale]/(app)/settings/locations/page.tsx`**

```tsx
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth"
import { prisma } from "@/lib/db/prisma"
import { StaffLocationsManager } from "@/components/settings/StaffLocationsManager"

export default async function LocationsPage({ params }: { params: { locale: string } }) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId) redirect(`/${params.locale}/login`)
  const locations = await prisma.location.findMany({ where: { userId }, orderBy: { createdAt: "asc" } })

  return (
    <div className="p-6 lg:p-8 max-w-xl" dir="rtl">
      <h1 className="font-display text-2xl font-bold text-[var(--color-text)] mb-6">סניפים</h1>
      <StaffLocationsManager
        items={locations}
        endpoint="/api/locations"
        nameLabel="שם סניף"
        secondaryLabel="כתובת"
        secondaryKey="address"
      />
    </div>
  )
}
```

- [ ] **Step 9: Create `components/settings/FormBuilder.tsx`**

```tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { FormField } from "@prisma/client"

interface Props {
  templateId: string | null
  fields: FormField[]
  title: string
  subtitle: string
  isActive: boolean
}

const inputClass = "h-9 w-full rounded-md border border-border bg-surface-raised px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
const labelClass = "text-sm font-medium text-[var(--color-text)]"

const FIELD_TYPES = [
  { value: "text", label: "טקסט חופשי" },
  { value: "textarea", label: "טקסט ארוך" },
  { value: "select", label: "רשימת בחירה" },
  { value: "radio", label: "בחירה אחת" },
  { value: "date", label: "תאריך" },
  { value: "number", label: "מספר" },
]

export function FormBuilder({ templateId, fields, title: initTitle, subtitle: initSubtitle, isActive: initActive }: Props) {
  const router = useRouter()
  const [title, setTitle] = useState(initTitle)
  const [subtitle, setSubtitle] = useState(initSubtitle)
  const [isActive, setIsActive] = useState(initActive)
  const [saving, setSaving] = useState(false)

  const [showAdd, setShowAdd] = useState(false)
  const [newField, setNewField] = useState({ type: "text", key: "", label: "", placeholder: "", isRequired: false, optionsRaw: "" })
  const [addLoading, setAddLoading] = useState(false)
  const [addError, setAddError] = useState("")

  async function saveTemplate() {
    setSaving(true)
    await fetch("/api/form-template", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, subtitle, isActive }),
    })
    setSaving(false)
    router.refresh()
  }

  async function addField() {
    setAddError("")
    if (!newField.key || !newField.label) { setAddError("מפתח ותווית חובה"); return }
    setAddLoading(true)

    let options: { label: string; value: string }[] | undefined
    if (["select", "radio"].includes(newField.type) && newField.optionsRaw) {
      options = newField.optionsRaw.split("\n").map(line => {
        const [value, ...rest] = line.split(":")
        return { value: value.trim(), label: rest.join(":").trim() || value.trim() }
      }).filter(o => o.value)
    }

    const res = await fetch("/api/form-template/fields", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: newField.type,
        key: newField.key,
        label: newField.label,
        placeholder: newField.placeholder || undefined,
        isRequired: newField.isRequired,
        displayOrder: fields.length,
        options,
      }),
    })
    setAddLoading(false)
    if (!res.ok) {
      const data = await res.json()
      setAddError(data?.error ?? "שגיאה בהוספה")
      return
    }
    setShowAdd(false)
    setNewField({ type: "text", key: "", label: "", placeholder: "", isRequired: false, optionsRaw: "" })
    router.refresh()
  }

  async function deleteField(id: string) {
    await fetch(`/api/form-template/fields/${id}`, { method: "DELETE" })
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-6 max-w-xl" dir="rtl">
      {/* Template meta */}
      <div className="bg-surface-raised rounded-2xl border border-border p-5 flex flex-col gap-3">
        <p className="font-semibold text-sm text-[var(--color-text)]">הגדרות טופס</p>
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>כותרת</label>
          <input className={inputClass} value={title} onChange={e => setTitle(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>תת-כותרת</label>
          <input className={inputClass} value={subtitle} onChange={e => setSubtitle(e.target.value)} />
        </div>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="accent-[var(--color-highlight)]" />
          הטופס פעיל
        </label>
        <button onClick={saveTemplate} disabled={saving} className="px-4 py-2 rounded-lg text-sm font-semibold text-white self-start disabled:opacity-60" style={{ background: "var(--color-highlight)" }}>
          {saving ? "שומר..." : "שמור הגדרות"}
        </button>
      </div>

      {/* Fields list */}
      <div>
        <p className="font-semibold text-sm text-[var(--color-text)] mb-3">שדות הטופס</p>
        <div className="bg-surface-raised rounded-xl border border-border divide-y divide-border mb-3">
          <div className="px-4 py-2.5 bg-[var(--color-surface)] rounded-t-xl">
            <p className="text-xs text-[var(--color-muted-fg)]">שם מלא · טלפון (ברירת מחדל, לא ניתן להסיר)</p>
          </div>
          {fields.filter(f => !f.isCore).map(f => (
            <div key={f.id} className="flex items-center justify-between px-4 py-2.5 gap-4">
              <div>
                <p className="text-sm font-medium text-[var(--color-text)]">{f.label}</p>
                <p className="text-xs text-[var(--color-muted-fg)]">{f.type} · {f.key}{f.isRequired ? " · חובה" : ""}</p>
              </div>
              <button onClick={() => deleteField(f.id)} className="text-xs text-red-400 hover:text-red-600 transition-colors">הסר</button>
            </div>
          ))}
          {fields.filter(f => !f.isCore).length === 0 && (
            <div className="px-4 py-4 text-center text-xs text-[var(--color-muted-fg)]">אין שדות נוספים עדיין</div>
          )}
        </div>

        {!showAdd ? (
          <button onClick={() => setShowAdd(true)} className="text-sm font-medium" style={{ color: "var(--color-highlight)" }}>+ הוסף שדה</button>
        ) : (
          <div className="bg-surface-raised rounded-xl border border-border p-4 flex flex-col gap-3">
            <p className="font-semibold text-sm">שדה חדש</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-[var(--color-muted-fg)]">סוג</label>
                <select className={inputClass} value={newField.type} onChange={e => setNewField(f => ({ ...f, type: e.target.value }))}>
                  {FIELD_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-[var(--color-muted-fg)]">מפתח (key)</label>
                <input className={inputClass} placeholder="first_visit" value={newField.key}
                  onChange={e => setNewField(f => ({ ...f, key: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "_") }))} />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-[var(--color-muted-fg)]">תווית</label>
              <input className={inputClass} placeholder="האם זה הטיפול הראשון שלך?" value={newField.label} onChange={e => setNewField(f => ({ ...f, label: e.target.value }))} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-[var(--color-muted-fg)]">placeholder (אופציונלי)</label>
              <input className={inputClass} value={newField.placeholder} onChange={e => setNewField(f => ({ ...f, placeholder: e.target.value }))} />
            </div>
            {["select", "radio"].includes(newField.type) && (
              <div className="flex flex-col gap-1">
                <label className="text-xs text-[var(--color-muted-fg)]">אפשרויות (שורה לכל אפשרות, בפורמט: value:תווית)</label>
                <textarea rows={3} className="rounded-md border border-border bg-surface-raised px-3 py-2 text-sm resize-none" placeholder={"yes:כן\nno:לא"} value={newField.optionsRaw} onChange={e => setNewField(f => ({ ...f, optionsRaw: e.target.value }))} />
              </div>
            )}
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={newField.isRequired} onChange={e => setNewField(f => ({ ...f, isRequired: e.target.checked }))} className="accent-[var(--color-highlight)]" />
              שדה חובה
            </label>
            {addError && <p className="text-xs text-red-500">{addError}</p>}
            <div className="flex gap-2">
              <button onClick={addField} disabled={addLoading} className="px-4 py-1.5 rounded-lg text-sm font-semibold text-white disabled:opacity-60" style={{ background: "var(--color-highlight)" }}>
                {addLoading ? "מוסיף..." : "הוסף שדה"}
              </button>
              <button onClick={() => { setShowAdd(false); setAddError("") }} className="px-3 py-1.5 rounded-lg text-sm border border-border hover:bg-surface transition-colors">ביטול</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 10: Create `app/[locale]/(app)/settings/form/page.tsx`**

```tsx
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth"
import { prisma } from "@/lib/db/prisma"
import { FormBuilder } from "@/components/settings/FormBuilder"

export default async function FormSettingsPage({ params }: { params: { locale: string } }) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId) redirect(`/${params.locale}/login`)

  const [template, user] = await Promise.all([
    prisma.formTemplate.findUnique({
      where: { userId },
      include: { fields: { orderBy: { displayOrder: "asc" } } },
    }),
    prisma.user.findUnique({ where: { id: userId }, select: { leadFormSlug: true } }),
  ])

  const slug = user?.leadFormSlug
  const baseUrl = process.env.NEXTAUTH_URL ?? "https://clinicflow-ai-xi.vercel.app"

  return (
    <div className="p-6 lg:p-8" dir="rtl">
      <div className="flex items-start justify-between mb-6 gap-4">
        <h1 className="font-display text-2xl font-bold text-[var(--color-text)]">טופס לידים</h1>
        {slug && (
          <a
            href={`${baseUrl}/f/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 text-sm underline"
            style={{ color: "var(--color-highlight)" }}
          >
            צפה בטופס ↗
          </a>
        )}
      </div>
      <FormBuilder
        templateId={template?.id ?? null}
        fields={template?.fields ?? []}
        title={template?.title ?? "השאר פרטים"}
        subtitle={template?.subtitle ?? ""}
        isActive={template?.isActive ?? false}
      />
    </div>
  )
}
```

- [ ] **Step 11: Compile check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 12: Commit**

```bash
git add app/[locale]/\(app\)/settings/ components/settings/
git commit -m "feat(admin): add settings hub, services, staff, locations, and form builder pages"
```

---

## Task 9: Seed Demo Data

**Files:**
- Create: `scripts/seed-demo-clinics.ts`

- [ ] **Step 1: Create seed script**

Create `scripts/seed-demo-clinics.ts`:

```ts
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  // Find or skip — use your own user email
  const userEmail = process.env.SEED_USER_EMAIL
  if (!userEmail) throw new Error("Set SEED_USER_EMAIL env var to your clinic user email")

  const user = await prisma.user.findUnique({ where: { email: userEmail } })
  if (!user) throw new Error(`User ${userEmail} not found`)

  // Clean existing demo data
  await prisma.formField.deleteMany({ where: { template: { userId: user.id } } })
  await prisma.formTemplate.deleteMany({ where: { userId: user.id } })
  await prisma.service.deleteMany({ where: { userId: user.id } })
  await prisma.serviceCategory.deleteMany({ where: { userId: user.id } })

  // ── Aesthetic Clinic ──────────────────────────────────────────

  const botoxCategory = await prisma.serviceCategory.create({
    data: { userId: user.id, name: "הזרקות", displayOrder: 0 },
  })
  const laserCategory = await prisma.serviceCategory.create({
    data: { userId: user.id, name: "לייזר", displayOrder: 1 },
  })

  const botox = await prisma.service.create({
    data: { userId: user.id, categoryId: botoxCategory.id, name: "בוטוקס פנים", description: "הזרקת בוטוקס לאזורי הפנים", priceType: "exact", priceValue: 80000, durationMin: 30, displayOrder: 0 },
  })
  await prisma.service.create({
    data: { userId: user.id, categoryId: botoxCategory.id, name: "פילר שפתיים", description: "הגדלה ועיצוב שפתיים", priceType: "from", priceValue: 60000, durationMin: 45, displayOrder: 1 },
  })
  await prisma.service.create({
    data: { userId: user.id, categoryId: botoxCategory.id, name: "ייעוץ אסתטי", description: "פגישת ייעוץ חינמית", priceType: "exact", priceValue: 0, durationMin: 20, displayOrder: 2 },
  })
  const laser = await prisma.service.create({
    data: { userId: user.id, categoryId: laserCategory.id, name: "הסרת שיער לייזר", priceType: "from", priceValue: 20000, durationMin: 30, displayOrder: 3 },
  })

  // Form template
  const template = await prisma.formTemplate.create({
    data: {
      userId: user.id,
      title: "קבעי תור לייעוץ",
      subtitle: "השאירי פרטים ונחזור אלייך בהקדם",
      isActive: true,
    },
  })

  // Fields
  await prisma.formField.createMany({
    data: [
      {
        templateId: template.id, type: "radio", key: "first_visit",
        label: "האם זה הטיפול הראשון שלך?", isRequired: false, displayOrder: 0,
        options: [{ label: "כן", value: "yes" }, { label: "לא", value: "no" }],
        conditions: [{ fieldKey: "service_id", operator: "eq", value: botox.id }],
      },
      {
        templateId: template.id, type: "select", key: "laser_area",
        label: "איזור להסרת שיער", isRequired: false, displayOrder: 1,
        options: [
          { label: "רגליים", value: "legs" }, { label: "בית השחי", value: "underarm" },
          { label: "פנים", value: "face" }, { label: "ביקיני", value: "bikini" },
        ],
        conditions: [{ fieldKey: "service_id", operator: "eq", value: laser.id }],
      },
      {
        templateId: template.id, type: "textarea", key: "notes",
        label: "הערות נוספות", placeholder: "כל פרט שחשוב לנו לדעת...", isRequired: false, displayOrder: 2,
        conditions: null, options: null,
      },
    ],
  })

  console.log(`✓ Seeded aesthetic clinic for ${userEmail}`)
  console.log(`  Services: בוטוקס, פילר, ייעוץ, לייזר`)
  console.log(`  FormTemplate active: true`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
```

- [ ] **Step 2: Run seed**

```bash
SEED_USER_EMAIL=your@email.com npx tsx scripts/seed-demo-clinics.ts
```

Expected output:
```
✓ Seeded aesthetic clinic for your@email.com
  Services: בוטוקס, פילר, ייעוץ, לייזר
  FormTemplate active: true
```

- [ ] **Step 3: Verify in browser**

Navigate to `http://localhost:3000/f/[your-slug]`. You should see:
- Service selector with 4 services and prices
- After selecting Botox: "האם זה הטיפול הראשון שלך?" appears
- After selecting Laser: "איזור להסרת שיער" appears
- Notes always visible

- [ ] **Step 4: Commit**

```bash
git add scripts/seed-demo-clinics.ts
git commit -m "feat(seed): add demo clinic seed script with services and conditional fields"
```

---

## Task 10: Final compile, test run, and push

- [ ] **Step 1: Run all tests**

```bash
npx vitest run
```

Expected: all tests pass.

- [ ] **Step 2: Production build**

```bash
npx next build
```

Expected: build completes with no errors.

- [ ] **Step 3: Push to production**

```bash
git push origin master
```

---

## Self-Review Checklist

- [x] Prisma models: ServiceCategory, Service, Location, StaffMember, FormTemplate, FormField — Task 1
- [x] Lead.serviceId + Lead.formAnswers — Task 1
- [x] Conditional logic with tests — Task 2
- [x] Zod schemas for all new entities — Task 3
- [x] Services CRUD API — Task 4
- [x] Staff, Locations, FormTemplate APIs — Task 5
- [x] Updated public submission endpoint — Task 6
- [x] Dynamic PublicLeadForm with conditions + service selector — Task 7
- [x] Admin settings pages (hub, services, staff, locations, form builder) — Task 8
- [x] Seed data for aesthetic clinic with conditional fields — Task 9
- [x] Backward compatibility with old leadFormConfig — Task 7 (fallback in page.tsx)
- [x] Price display logic (exact/from/hidden) — Task 7 (formatPrice fn)
- [x] Type consistency: `FieldCondition` used in evaluate-conditions.ts and imported in PublicLeadForm.tsx
