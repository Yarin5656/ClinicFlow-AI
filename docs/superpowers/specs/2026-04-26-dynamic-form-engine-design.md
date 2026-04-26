# Dynamic Form Engine — Design Spec
**Date:** 2026-04-26  
**Scope:** Phase 1 (Service Config) + Phase 2 (Dynamic Form Engine)  
**Phase 3** (Booking / appointment slots) is a separate cycle, intentionally excluded here.

---

## 1. Context & Goals

The existing system has a hardcoded public lead form at `/f/[slug]` that reads from `User.leadFormConfig` (a JSON blob with `{title, subtitle, fields[], active}`). It captures name, phone, and a handful of optional fields. There are no services, no conditions, and no per-field customisation.

**Goal:** Replace this with a configuration-driven form engine where each clinic owner can:
- Define their service catalogue (name, price, duration, category, lead-only vs bookable)
- Build a form from typed fields with conditional display rules
- Keep the same public URL (`/f/[slug]`) working, now powered by the new engine

**Out of scope for this phase:**
- Appointment/slot booking (Phase 3)
- Visual drag-and-drop form builder (Phase 4)
- Multi-tenant Clinic model (single User = single clinic is sufficient now)

---

## 2. Data Model

### New Prisma models

```prisma
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
  // "exact" | "from" | "hidden"
  priceType    String   @default("hidden")
  // Price in lowest currency unit (agorot). null when hidden.
  priceValue   Int?
  durationMin  Int?
  isActive     Boolean  @default(true)
  // false = lead-only (no booking slot shown). true = bookable (Phase 3).
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
  id       String   @id @default(cuid())
  userId   String
  name     String
  address  String?
  isActive Boolean  @default(true)
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
  // "text" | "textarea" | "select" | "radio" | "checkbox" | "number" | "phone" | "date"
  type         String
  // Internal key used in conditional rules (e.g. "service_id", "first_visit")
  key          String
  label        String
  placeholder  String?
  isRequired   Boolean  @default(false)
  // Core fields (name, phone) are always shown and cannot be removed
  isCore       Boolean  @default(false)
  displayOrder Int      @default(0)
  // For select/radio/checkbox: [{label: string, value: string}]
  options      Json?
  // Conditions that must ALL be true for this field to appear.
  // Shape: [{fieldKey: string, operator: "eq"|"neq"|"contains", value: string}]
  // Empty array or null = always shown.
  conditions   Json?
  createdAt    DateTime @default(now())

  template FormTemplate @relation(fields: [templateId], references: [id], onDelete: Cascade)

  @@index([templateId])
}
```

### Changes to existing models

```prisma
// Lead — add optional serviceId and formAnswers
model Lead {
  ...existing fields...
  serviceId   String?
  formAnswers Json?   // { fieldKey: value } map from public form submission
  service     Service? @relation(fields: [serviceId], references: [id], onDelete: SetNull)
}
```

### Migration strategy for existing `User.leadFormConfig`

A one-time migration script (`scripts/migrate-form-config.ts`) will:
1. For each User with a non-null `leadFormConfig`, create a `FormTemplate` with the same title/subtitle/isActive.
2. Convert the existing `fields[]` array (treatment, source, message, preferredDate) into `FormField` rows.
3. Leave `User.leadFormSlug` and `User.leadFormConfig` in place for now (deprecated but not removed until Phase 4).

The public route `/f/[slug]` will prefer `FormTemplate` if it exists, fall back to `leadFormConfig` for users who haven't migrated.

---

## 3. Architecture

### Component tree

```
app/
  f/[slug]/
    page.tsx              ← server: loads FormTemplate by User.leadFormSlug
    thanks/page.tsx       ← unchanged

  api/public/
    lead-form/[slug]/
      route.ts            ← extend to accept serviceId + custom field answers

  [locale]/(app)/
    settings/
      services/
        page.tsx          ← services list
        new/page.tsx      ← create service
        [id]/page.tsx     ← edit service
      staff/
        page.tsx          ← staff list + inline add/edit
      locations/
        page.tsx          ← locations list + inline add/edit
      form/
        page.tsx          ← form builder (field list, add field, conditions)
        preview/page.tsx  ← iframe/server render of /f/[slug]

components/
  f/
    PublicLeadForm.tsx    ← rewrite: reads FormField[], evaluates conditions
    ServiceSelector.tsx  ← service picker with price display
    DynamicField.tsx     ← renders any FormField type
    ConditionalWrapper.tsx ← evaluates field.conditions against current form state

  settings/
    services/
      ServiceForm.tsx
      ServiceList.tsx
    form-builder/
      FieldList.tsx
      AddFieldModal.tsx
      ConditionEditor.tsx

lib/
  validations/
    lead-form.ts          ← extend publicSubmitSchema with serviceId + answers map
    service.ts            ← new: service CRUD schemas
  form/
    evaluate-conditions.ts ← pure fn: (fields, formState) => visibleFieldKeys[]
    build-submission.ts    ← maps form state to API payload

```

### Public form data flow

```
GET /f/[slug]
  → find User by leadFormSlug
  → find FormTemplate by userId (if exists)
  → if no FormTemplate, fall back to leadFormConfig
  → render PublicLeadForm with fields[]

POST /api/public/lead-form/[slug]
  body: { name, phone, serviceId?, answers: Record<string, unknown> }
  → validate core fields
  → validate required custom fields against template
  → tx: create Client → create Lead (with serviceId, formAnswers)
  → generateFollowUpTasksForLead()
  → sendLeadNotification()
  → 201 { ok: true }
```

### Lead answers storage

Rather than a separate `LeadAnswer` table (premature), answers for custom fields are stored as `Lead.formAnswers` (JSON). This is already included in the "Changes to existing models" section above.

---

## 4. Conditional Logic

**Rule evaluation is pure, client-side and server-side.**

```ts
// lib/form/evaluate-conditions.ts
type Condition = { fieldKey: string; operator: "eq" | "neq" | "contains"; value: string }

export function evaluateConditions(
  conditions: Condition[] | null | undefined,
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

The `PublicLeadForm` component maintains `formState` in React state. On every change, it re-evaluates which fields are visible. Hidden fields are not submitted.

---

## 5. Price Display Logic

On `ServiceSelector`, each service renders based on `priceType`:

| priceType | Display |
|-----------|---------|
| `exact`   | `₪{price}` |
| `from`    | `מ-₪{price}` |
| `hidden`  | nothing shown |

Price is in agorot (integers). Display divides by 100.

---

## 6. Admin Pages

All under `/he/(app)/settings/`:

### `/settings/services`
- Table of services: name, category, price, duration, active toggle, edit/delete
- "Add service" button → `/settings/services/new`
- Inline active toggle (optimistic)

### `/settings/services/new` and `/settings/services/[id]`
Form fields: name, description, category (select or create inline), priceType, priceValue, durationMin, isBookable, staff (optional), location (optional), displayOrder, isActive.

### `/settings/staff` and `/settings/locations`
Simple inline CRUD lists (add row, edit in-place, delete).

### `/settings/form`
- Ordered list of FormFields
- Each field row shows: type, label, required toggle, conditions summary, edit/delete
- "Add field" button → AddFieldModal (type, label, placeholder, required, options, conditions)
- "Preview form" button → opens `/f/[slug]` in new tab

---

## 7. Seed Data

Two example clinics (created via `scripts/seed-demo.ts`):

### Clinic A — Aesthetic Clinic (מרפאת אסתטיקה)
**Services:**
- בוטוקס פנים — exact ₪800, 30min, lead-only
- פילר שפתיים — from ₪600, 45min, lead-only
- ייעוץ אסתטי — exact ₪0 (free), 20min, lead-only
- הסרת שיער לייזר — from ₪200, 30min, lead-only

**Form fields** (beyond core name/phone):
1. service selector (required)
2. "האם זה הטיפול הראשון שלך?" — radio (כן/לא), condition: service=בוטוקס
3. "איזור להסרה?" — select (רגליים/בית השחי/פנים), condition: service=הסרת שיער לייזר
4. הערות — textarea (optional, always shown)

### Clinic B — Beauty Studio (סטודיו ביוטי)
**Services:**
- ג'ל ציפורניים — exact ₪150, 60min, lead-only
- ריסים קלאסי — exact ₪200, 90min, lead-only
- עיצוב גבות — exact ₪80, 30min, lead-only

**Form fields** (beyond core name/phone):
1. service selector (required)
2. "מה הצבע המועדף?" — text, condition: service=ג'ל ציפורניים
3. הערות — textarea (optional, always shown)

---

## 8. API Routes

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/services` | List services for authed user |
| POST | `/api/services` | Create service |
| PUT | `/api/services/[id]` | Update service |
| DELETE | `/api/services/[id]` | Delete service |
| GET | `/api/staff` | List staff members |
| POST | `/api/staff` | Create staff member |
| PUT | `/api/staff/[id]` | Update / delete staff |
| GET | `/api/locations` | List locations |
| POST | `/api/locations` | Create location |
| PUT | `/api/locations/[id]` | Update / delete location |
| GET | `/api/form-template` | Get user's FormTemplate + fields |
| PUT | `/api/form-template` | Upsert FormTemplate |
| POST | `/api/form-template/fields` | Add field |
| PUT | `/api/form-template/fields/[id]` | Update field |
| DELETE | `/api/form-template/fields/[id]` | Delete field |
| POST | `/api/public/lead-form/[slug]` | Extended: accepts serviceId + formAnswers |

---

## 9. What Is Not Built Yet (Phase 3+)

- Appointment / time-slot booking
- Staff availability calendar
- SMS/WhatsApp notifications
- Visual drag-and-drop form builder
- Multi-location availability

---

## 10. Implementation Order

1. Prisma migrations (new models + Lead.serviceId + Lead.formAnswers)
2. Migration script for existing leadFormConfig → FormTemplate
3. API routes: services, staff, locations, form-template
4. Admin settings pages (services → staff/locations → form builder)
5. Rewrite `PublicLeadForm` + `evaluate-conditions`
6. Update `/api/public/lead-form/[slug]` to handle new payload
7. Seed data for 2 demo clinics
8. Smoke test: submit form, verify Lead + answers saved
