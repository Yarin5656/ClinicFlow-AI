# ClinicFlow AI — Pivot Design Spec
**Date:** 2026-04-20  
**Status:** Approved by user

---

## Context

MoveEasy Israel is being pivoted to **ClinicFlow AI** — an AI back office copilot for aesthetic clinics. The pivot reuses all existing infrastructure (auth, task engine, reminders, documents, workflow engine, layout) and adds a `Client` + `Lead` domain on top. No rebuild from scratch. Free-tier only. Goal: a demo-ready product that shows how a clinic never loses a lead.

**Core demo story:**
> A new lead comes in → AI summarizes the inquiry → follow-up tasks are auto-created → the dashboard shows what's new, in progress, and falling through the cracks.

---

## What Gets Recycled As-Is

| System | Reuse | Notes |
|---|---|---|
| Auth (NextAuth + bcrypt) | ✅ 100% | No changes |
| Task model + status enum | ✅ 100% | PENDING/IN_PROGRESS/DONE/SKIPPED maps perfectly |
| Reminder model | ✅ 100% | Repurposed for follow-up alerts |
| Workflow engine (`lib/workflows/engine.ts`) | ✅ ~80% | New JSON workflow definitions only |
| Document upload + storage | ✅ 100% | Add `clientId` foreign key |
| Sidebar layout + Header | ✅ ~70% | New nav items, same structure |
| Settings page | ✅ 100% | No changes |
| Tailwind config + RTL | ✅ 100% | Same dark navy + green palette |
| Tasks page + detail | ✅ ~60% | Rebrand labels, link to Lead instead of WorkflowStep |

---

## Data Model Changes

### New models (add to Prisma schema)

```prisma
model Client {
  id             String    @id @default(cuid())
  userId         String                          // clinic owner
  name           String
  phone          String
  source         String?                         // instagram, whatsapp, google, referral
  treatmentWanted String?
  notes          String?
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt

  leads          Lead[]
  documents      Document[]
  reminders      Reminder[]

  user           User      @relation(fields: [userId], references: [id])
}

model Lead {
  id             String    @id @default(cuid())
  clientId       String
  status         LeadStatus @default(NEW)
  aiSummary      String?                         // AI-generated summary of inquiry
  aiTags         String[]                        // e.g. ["בוטוקס","לקוחה חדשה"]
  source         String?
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt

  client         Client    @relation(fields: [clientId], references: [id])
  tasks          Task[]
}

enum LeadStatus {
  NEW
  FOLLOW_UP
  QUOTED
  BOOKED
  WON
  LOST
}
```

### Modified models

- `Task`: add optional `leadId String?` + `Lead` relation (alongside existing `workflowStepId`)
- `Document`: add optional `clientId String?` + `Client` relation
- `Reminder`: add optional `clientId String?` + `Client` relation
- `Household`, `MoveProfile`, `Workflow`, `WorkflowStep`: **kept, not deleted** (can be cleaned up later)

---

## New Workflow Definitions (JSON)

Replace `/workflows/*.json` with clinic-specific workflows:

### `lead-intake.json`
Steps: צור קשר ראשוני → שלח מחירון/לפני-אחרי → תזכורת סגירה  
Trigger: every new Lead

### `follow-up-post-treatment.json`  
Steps: בדיקת שביעות רצון → בקשת ביקורת → הצעת טיפול חוזר  
Trigger: Lead status = BOOKED after appointment date

### `no-show-recovery.json`
Steps: שלח הודעת התחשבות → הצעת מועד חלופי → הנחה אם אין תגובה  
Trigger: manual (mark as no-show)

---

## Screens

### Stays (rebrand labels only)
- `/settings` — no changes
- `/reminders` — change copy to clinic context
- `/tasks` — rebrand "משימות" stays, add filter by lead

### Modified
- `/dashboard` — full redesign: stats (new leads, follow-ups pending, overdue, bookings) + leads table + follow-up sidebar
- `/documents` — add client filter, change docTypes to: consent-form, before-photo, after-photo, treatment-plan, invoice

### New pages
- `/leads` — list of all leads with status badges + filters
- `/leads/[id]` — lead detail: AI summary, status pipeline, follow-up tasks, timeline, client notes
- `/clients` — list of clients (people, not leads)
- `/clients/[id]` — client profile with all their leads + documents

### Removed from nav
- `/onboarding` — replaced by "ליד חדש" modal flow
- `/admin/workflows` — hidden for now (MVP)

---

## Navigation (Sidebar)

```
🏥 ClinicFlow AI
────────────────
◉  דשבורד
👥  לידים
✅  משימות Follow-up
📋  לקוחות
🔔  תזכורות
────────────────
⚙️  הגדרות
```

---

## AI Features (Free Only)

No paid LLM API calls for now. The "AI" in the product is:
1. **Auto-task generation** — workflow engine creates follow-up tasks when a lead is added (already exists, just new JSON)
2. **AI summary field** — `Lead.aiSummary` is a free-text field that the user fills manually OR we populate via a free model later
3. **AI tags** — `Lead.aiTags` array, populated manually or via pattern matching on notes

**Future (not in scope now):** Claude API integration to auto-summarize WhatsApp messages on lead creation.

---

## Branding

| Element | Before | After |
|---|---|---|
| Product name | MoveEasy | ClinicFlow AI |
| Tagline | מעבר דירה בלי להיאבד בביורוקרטיה | הקליניקה שלך. כל ליד. בלי להיאבד. |
| Domain concept | moving house | aesthetic clinic leads |
| Palette | dark navy + green | same (keep) |
| Font | Heebo + Frank Ruhl | same (keep) |
| Logo icon | 🏠 | 🏥 (temp, real logo later) |

---

## Landing Page

Full rewrite of `/app/page.tsx`. New sections:
1. **Hero**: "לא מאבדים לידים. ClinicFlow AI עוקב בשבילך."
2. **Stats banner**: ממוצע 40% לידים שאובדים בלי follow-up / 3 דקות להגדרה / 0 ש"ח לחודש
3. **Feature cards**: ניהול לידים · follow-up אוטומטי · סיכום AI · דשבורד
4. **CTA**: "התחל בחינם — בלי כרטיס אשראי"

---

## API Routes (New)

| Route | Method | Purpose |
|---|---|---|
| `/api/clients` | GET, POST | List / create clients |
| `/api/clients/[id]` | GET, PATCH | Get / update client |
| `/api/leads` | GET, POST | List / create leads |
| `/api/leads/[id]` | GET, PATCH | Get / update lead (status change) |

Existing routes (`/api/tasks`, `/api/reminders`, `/api/documents`) stay unchanged.

---

## Out of Scope (This Phase)

- WhatsApp / Instagram integration
- Real AI API calls (Claude, OpenAI)
- Appointment calendar view
- Payment / billing
- Multi-user (staff roles)
- Email / SMS notifications

---

## Verification

1. `npm run dev` — app loads, sidebar shows new nav items
2. Create a lead → workflow engine generates 3 follow-up tasks automatically
3. Lead detail page shows AI summary + status pipeline + tasks
4. Dashboard stats reflect real DB counts
5. Existing auth flow unchanged — login still works
6. `npm test` — existing 13 tests still pass
