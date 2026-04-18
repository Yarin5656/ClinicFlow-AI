/**
 * End-to-end smoke test of the core MVP flow.
 * Exercises: register → login → onboarding → task update → upload → reminder.
 * Run with: npx tsx scripts/demo-e2e.ts
 */
import fs from "fs/promises"

const BASE = process.env.BASE ?? "http://localhost:3000"
const email = `demo-${Date.now()}@test.com`

const extractCookies = (res: Response): string[] => {
  const h = res.headers as Headers & { getSetCookie?: () => string[] }
  if (typeof h.getSetCookie === "function") return h.getSetCookie()
  const s = res.headers.get("set-cookie")
  return s ? [s] : []
}
const joinCookies = (cs: string[]): string =>
  cs.map((c) => c.split(";")[0]).join("; ")

const log = (label: string, ok: boolean, detail: string) =>
  console.log(`${ok ? "✅" : "❌"} ${label.padEnd(28)} ${detail}`)

async function main() {
  // 1. Register
  const reg = await fetch(`${BASE}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "משתמש דמו", email, password: "password123" }),
  })
  log("Register", reg.status === 201, `HTTP ${reg.status}`)

  // 2. Login
  const csrfRes = await fetch(`${BASE}/api/auth/csrf`)
  const { csrfToken } = (await csrfRes.json()) as { csrfToken: string }
  const csrfCookies = extractCookies(csrfRes)
  const loginRes = await fetch(`${BASE}/api/auth/callback/credentials`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Cookie: joinCookies(csrfCookies),
    },
    body: new URLSearchParams({ csrfToken, email, password: "password123", json: "true" }),
    redirect: "manual",
  })
  const cookie = joinCookies([...csrfCookies, ...extractCookies(loginRes)])
  log("Login", loginRes.status === 200, `HTTP ${loginRes.status}`)

  // 3. Onboarding (employee with children + car — expect 11 tasks)
  const ob = await fetch(`${BASE}/api/onboarding`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({
      toAddress: "תל אביב",
      moveDate: "2026-06-01",
      answers: {
        moveDate: "2026-06-01",
        targetCity: "תל אביב",
        tenantType: "renter",
        hasChildren: true,
        hasCar: true,
        employmentType: "employee",
      },
    }),
  })
  const obBody = await ob.json() as { tasks?: { created: number } }
  log("Onboarding", ob.status === 200 && obBody.tasks?.created === 11,
      `${obBody.tasks?.created} משימות נוצרו`)

  // 4. Fetch dashboard
  const dash = await fetch(`${BASE}/dashboard`, { headers: { Cookie: cookie } })
  const dashHtml = await dash.text()
  log("Dashboard", dash.status === 200 && dashHtml.includes("שינוי כתובת"),
      "רואה 3 workflow cards")

  // 5. Get first task + update status to IN_PROGRESS
  const tasks = await fetch(`${BASE}/tasks`, { headers: { Cookie: cookie } })
  const taskHtml = await tasks.text()
  const taskId = taskHtml.match(/href="\/tasks\/([^"]+)"/)?.[1]
  if (!taskId) throw new Error("No task id")

  const patch = await fetch(`${BASE}/api/tasks/${taskId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({ status: "IN_PROGRESS", notes: "התחלתי לטפל" }),
  })
  log("Task status + notes", patch.status === 200, `HTTP ${patch.status}`)

  // 6. Upload document
  await fs.writeFile("/tmp/demo.pdf", "%PDF-1.4\n%demo\n%%EOF\n")
  const buf = await fs.readFile("/tmp/demo.pdf")
  const form = new FormData()
  form.append("file", new Blob([new Uint8Array(buf)], { type: "application/pdf" }), "חוזה-שכירות.pdf")
  form.append("taskId", taskId)
  const up = await fetch(`${BASE}/api/documents`, {
    method: "POST",
    headers: { Cookie: cookie },
    body: form,
  })
  const upBody = await up.json() as { document?: { id: string; filename: string } }
  log("Document upload", up.status === 201, `${upBody.document?.filename}`)

  // 7. Create reminder
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  const rem = await fetch(`${BASE}/api/reminders`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({ message: "לא לשכוח ללכת לעירייה", scheduledAt: tomorrow, taskId }),
  })
  log("Reminder create", rem.status === 201, `HTTP ${rem.status}`)

  // 8. Verify reminders list includes both the manual one + any auto-generated
  //    deadline reminders (Quick Win 2 creates these during onboarding).
  const list = await fetch(`${BASE}/api/reminders`, { headers: { Cookie: cookie } })
  const listBody = await list.json() as {
    reminders: { message: string; isAutomatic?: boolean }[]
  }
  const autoCount = listBody.reminders.filter((r) => r.isAutomatic).length
  const manualCount = listBody.reminders.length - autoCount
  log("Reminders list", list.status === 200 && manualCount >= 1,
      `${manualCount} ידניות + ${autoCount} דדליין רשמי`)

  console.log("\n🎉 Core MVP flow verified end-to-end")
}

main().catch((e) => {
  console.error("\n❌ Demo E2E failed:", e.message ?? e)
  process.exit(1)
})
