# Lead Capture Form — Design Spec
**Date:** 2026-04-22  
**Status:** Approved

---

## Goal

Each clinic gets a unique public URL they can share on Instagram, Facebook, or any social network. Visitors fill in a form; the lead is automatically created in the clinic's dashboard and the clinic receives an email notification.

---

## Database

One field added to `User`:

```prisma
model User {
  ...
  leadFormSlug   String?  @unique   // e.g. "my-clinic"
  leadFormConfig Json?              // see shape below
}
```

`leadFormConfig` shape:
```json
{
  "title": "השאירי פרטים ונחזור אליך",
  "subtitle": "קליניקת יופי — בוטוקס, לייזר ועוד",
  "fields": ["name", "phone", "treatment", "message"],
  "active": true
}
```

Available fields (name + phone always required, rest optional):
- `name` — always on, not toggleable
- `phone` — always on, not toggleable
- `treatment` — טיפול מבוקש
- `source` — מאיפה שמעת עלינו
- `message` — הודעה חופשית
- `preferredDate` — תאריך מועדף

---

## Pages

### 1. Settings — new "Lead Form" section  
`/[locale]/settings`

Added below existing profile section. Shows:
- Toggle: activate/deactivate form
- Slug input (editable, validated unique)
- Preview of generated URL
- Title field
- Subtitle field
- Field toggles (checkboxes for optional fields)
- "Copy link" button

Saves via `PATCH /api/user/lead-form`.

### 2. Public form page  
`/f/[slug]`

Public (no auth). Branded page with:
- Clinic name / subtitle from config
- Form with active fields
- Submit button
- On success → redirect to `/f/[slug]/thanks`
- If `active: false` or slug not found → 404

### 3. Thank-you page  
`/f/[slug]/thanks`

Simple confirmation: "תודה! ניצור איתך קשר בקרוב."

---

## API

### `POST /api/public/lead-form/[slug]`
No auth required.

1. Look up User by `leadFormSlug`
2. Validate form is active
3. Validate body against active fields (name + phone required)
4. Rate-limit by IP using existing `checkRateLimit` util: max 5 submissions / 10 min
5. Create `Client` (userId = clinic owner)
6. Create `Lead` (status: NEW)
7. Trigger `generateFollowUpTasksForLead`
8. Send notification email to clinic owner
9. Return `{ ok: true }`

### `PATCH /api/user/lead-form`
Auth required. Updates `leadFormSlug` + `leadFormConfig` on User.

Validates:
- Slug: 3–40 chars, lowercase alphanumeric + hyphens, unique
- Config fields valid subset of allowed fields
- Title: non-empty string

---

## Email Notification

Sent via `resend` (npm package, free tier 3k emails/month). Requires `RESEND_API_KEY` env var.
Uses existing `User.email` as recipient.

Subject: `ליד חדש מ-[clinic name]: [client name]`

Body (plain HTML):
- Client name + phone
- Treatment wanted (if filled)
- Message (if filled)
- "לצפייה בליד" → direct link to `/[locale]/leads`

---

## In-App Notification

The existing `ReminderBell` polls `/api/reminders`. No change needed — the follow-up tasks created by `generateFollowUpTasksForLead` will naturally surface in the bell.

---

## Error Handling

| Scenario | Behaviour |
|----------|-----------|
| Slug not found | 404 page |
| Form inactive | 404 page |
| Rate limit exceeded | 429, user sees "נסה שוב מאוחר יותר" |
| Email send fails | Lead still saved, error logged silently |
| Duplicate phone same clinic | New lead created (by design — clinic decides) |

---

## Out of Scope

- Multi-form per clinic (one form per clinic for now)
- Custom branding colors / logo upload
- Analytics / conversion tracking
- Zapier / Make webhook integrations
