# MoveEasy Israel

**אפליקציית web לניהול ביורוקרטיית מעבר דירה בישראל.** MVP בעברית עם תמיכת RTL מלאה.

מכסה שלושה תהליכים ראשיים:
1. **שינוי כתובת רשמית** (משרד הפנים, ביטוח לאומי, קופות, בנק, רישיון נהיגה)
2. **ארנונה עירונית** (הצהרת מעבר, ביטול ישן, הנחות, שירותים עירוניים)
3. **רשות המסים** (מס הכנסה, מעביד/מע״מ לפי סוג תעסוקה)

## Stack

- **Frontend:** Next.js 14 (App Router) + TypeScript + Tailwind CSS + RTL
- **Backend:** Next.js Route Handlers
- **DB:** Prisma + SQLite (לוקאלי) / PostgreSQL (פרודקשן)
- **Auth:** NextAuth v4 credentials (email + bcrypt)
- **Storage:** Local filesystem עם abstraction ל-S3/R2
- **Validation:** Zod + React Hook Form
- **Testing:** Vitest

## Local setup

```bash
# דרישות: Node 18+
npm install

# הגדרת DB (SQLite לוקאלי)
npm run db:migrate       # יוצר prisma/dev.db + מריץ מיגרציות
npm run db:seed          # admin user + 3 workflows + 12 steps

# הרצה
npm run dev              # → http://localhost:3000

# בדיקות
npm test                 # 13 tests (storage + workflow engine)
```

### משתמשי דמו

| Email | Password | תיאור |
|---|---|---|
| `admin@moveeasy.local` | `admin1234` | Admin (נוצר ב-seed) |

משתמשים נוספים נוצרים דרך `/register`. אחרי הרשמה — משתמש חדש מופנה ל-onboarding wizard.

## Project structure

```
moveeasy-israel/
├── app/
│   ├── (auth)/login, register      # דפי התחברות / הרשמה
│   ├── (app)/                       # מוגן על ידי middleware
│   │   ├── dashboard                # workflow cards + progress
│   │   ├── tasks/, tasks/[id]       # רשימה + פרטי משימה
│   │   ├── documents                # כל המסמכים של המשתמש
│   │   └── reminders                # תזכורות in-app
│   ├── onboarding/                  # wizard (מחוץ ל-sidebar)
│   ├── admin/                       # stubs ל-admin panel (Later)
│   └── api/
│       ├── auth/                    # NextAuth + register
│       ├── onboarding/              # יצירת משימות אישיות
│       ├── tasks/[id]               # PATCH status/notes
│       ├── documents/, [id], [id]/file
│       └── reminders/, [id]
│
├── components/
│   ├── ui/                          # Button, Card, Input, StatusBadge, ...
│   ├── onboarding/                  # WizardShell + 6 steps
│   ├── tasks/                       # WorkflowCard, StatusToggle, TaskNotes
│   ├── documents/                   # UploadZone, DocumentList
│   ├── reminders/                   # CreateReminderForm, ReminderItem
│   └── layout/                      # Header, Sidebar, ReminderBell
│
├── lib/
│   ├── db/prisma.ts                 # singleton client
│   ├── storage/                     # StorageProvider interface + Local impl
│   ├── workflows/                   # loader.ts + engine.ts
│   ├── auth/auth.ts                 # NextAuth config
│   ├── tasks/aggregate.ts           # dashboard aggregations
│   └── validations/                 # Zod schemas per domain
│
├── workflows/                       # 3 קבצי JSON עם ה-workflows
├── prisma/
│   ├── schema.prisma                # 9 models
│   ├── migrations/                  # migrations history
│   └── seed.ts                      # admin + workflow upsert
├── __tests__/                       # engine + storage tests
└── types/index.ts                   # shared types
```

## Workflow engine

Workflows מוגדרים כ-JSON ב-`workflows/*.json`. כל workflow מכיל `slug`, `title`, `description`, `triggerConditions` אופציונליים, ומערך `steps` שכל אחד יכול לכלול גם `triggerConditions` ברמת ה-step.

### Trigger conditions (AND logic)

```json
{ "employmentType": "self-employed" }
```

בשלב ה-seed קבצי ה-JSON נטענים ל-DB. בסיום ה-onboarding, `generateTasksForUser` רץ על כל ה-workflows הפעילים ויוצר `Task` לכל `WorkflowStep` שהתנאים שלו מתאימים לתשובות ה-wizard (workflow-level AND step-level).

### הוספת workflow חדש

1. צור `workflows/<slug>.json` לפי הפורמט הקיים
2. `npm run db:seed` — ה-seed מעדכן DB אוטומטית
3. משתמשים שעברו onboarding יקבלו את המשימות החדשות בהרצה הבאה של ה-engine

## Storage

`lib/storage/StorageProvider.ts` מגדיר interface עם `upload` + `delete`. `LocalStorageProvider` שומר ב-`storage/<userId>/` (מחוץ ל-`public/`, מוגש דרך API route מאובטח). להחליף ל-S3:

```ts
// lib/storage/index.ts
export function getStorageProvider() {
  return new S3StorageProvider()  // במקום LocalStorageProvider
}
```

## מה mocked / mvp vs production

| | מצב |
|---|---|
| Auth (bcrypt + DB) | Production-ready |
| Prisma schema | Production-ready |
| Workflow engine | Production-ready |
| File storage | **MVP** — local disk, לא scalable |
| Reminders | **MVP** — in-app only (ללא email/SMS) |
| Admin panel | **Stubs** — לא פעיל |
| Password reset | חסר |

## Production deployment

כדי להעלות ל-Vercel + Postgres:

1. `prisma/schema.prisma`: שנה `provider = "sqlite"` ל-`"postgresql"`
2. `DATABASE_URL` — connection string של Postgres hosted (Neon / Supabase / Railway)
3. `NEXTAUTH_SECRET` — `openssl rand -base64 32`
4. `NEXTAUTH_URL` — הדומיין של ה-deployment
5. מיגרציות: `npx prisma migrate deploy`
6. Seed workflows: `npm run db:seed` (idempotent)

> ⚠️ File storage: ב-Vercel filesystem הוא ephemeral. החלף ל-S3/R2 לפני deployment לפרודקשן.

## Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | dev server (hot reload) |
| `npm test` | Vitest — 13 tests |
| `npm run db:migrate` | prisma migrate dev |
| `npm run db:seed` | seed admin + workflows |
| `npm run db:studio` | פתיחת Prisma Studio לעיון ב-DB |
| `npm run db:generate` | regenerate Prisma Client |
| `npm run build` / `start` | production build + run |

## Architecture decisions

- **Route groups**: `(auth)` ל-public, `(app)` ל-protected (sidebar + header), `onboarding/` מחוץ לקבוצה לקבלת full-screen.
- **Workflow engine ב-DB**: JSON files = source of truth ב-dev, אבל בפרודקשן ה-DB הוא source של אמת. ה-seed upsert-ים לפי slug כך שאפשר לערוך את ה-JSON ולעשות seed מחדש בלי לאבד user data.
- **Idempotency**: `Task @@unique([userId, workflowStepId])` מבטיח ש-`generateTasksForUser` אפשר להריץ שוב בלי כפילויות.
- **Storage path outside public/**: קבצי משתמשים לא נגישים דרך URL ישיר. כל download עובר `GET /api/documents/[id]/file` עם בדיקת ownership.
- **OKLCH color tokens**: פלטה מגוונת (navy + teal accent) עם `--color-*` CSS variables; קל להוסיף dark mode או להחליף מיתוג ללא מגע בקומפוננטות.
