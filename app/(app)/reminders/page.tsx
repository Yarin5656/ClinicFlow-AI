import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth"
import { prisma } from "@/lib/db/prisma"
import { Header } from "@/components/layout/Header"
import { Card } from "@/components/ui/Card"
import { EmptyState } from "@/components/ui/EmptyState"
import { CreateReminderForm } from "@/components/reminders/CreateReminderForm"
import { ReminderItem, type ReminderItemData } from "@/components/reminders/ReminderItem"

export const metadata = { title: "תזכורות — MoveEasy Israel" }

export default async function RemindersPage() {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId) redirect("/login")

  const reminders = await prisma.reminder.findMany({
    where: { userId },
    include: {
      task: {
        select: {
          id: true,
          workflowStep: { select: { title: true } },
        },
      },
    },
    orderBy: { scheduledAt: "asc" },
  })

  const now = Date.now()
  const dueUnseen: ReminderItemData[] = []
  const upcoming: ReminderItemData[] = []
  const done: ReminderItemData[] = []

  for (const r of reminders) {
    const isDue = r.scheduledAt.getTime() <= now
    if (isDue && !r.seen) dueUnseen.push(r)
    else if (!isDue) upcoming.push(r)
    else done.push(r) // past + seen
  }

  return (
    <>
      <Header
        title="תזכורות"
        subtitle={`${dueUnseen.length} ממתינות לטיפול · ${upcoming.length} עתידיות`}
      />
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-2xl mx-auto flex flex-col gap-6">
          <Card padding="lg">
            <h3 className="font-display text-base font-medium text-[var(--color-text)] mb-4">
              תזכורת חדשה
            </h3>
            <CreateReminderForm />
          </Card>

          {reminders.length === 0 ? (
            <Card>
              <EmptyState
                icon="🔔"
                title="אין תזכורות עדיין"
                description="צור תזכורת כדי לא לשכוח משימה חשובה."
              />
            </Card>
          ) : (
            <>
              {dueUnseen.length > 0 && (
                <section className="flex flex-col gap-2">
                  <h2 className="text-xs uppercase tracking-wide text-[var(--color-warning)] font-semibold">
                    הגיע הזמן ({dueUnseen.length})
                  </h2>
                  <ul className="flex flex-col gap-2">
                    {dueUnseen.map((r) => (
                      <ReminderItem key={r.id} reminder={r} />
                    ))}
                  </ul>
                </section>
              )}

              {upcoming.length > 0 && (
                <section className="flex flex-col gap-2">
                  <h2 className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">
                    עתידיות ({upcoming.length})
                  </h2>
                  <ul className="flex flex-col gap-2">
                    {upcoming.map((r) => (
                      <ReminderItem key={r.id} reminder={r} />
                    ))}
                  </ul>
                </section>
              )}

              {done.length > 0 && (
                <section className="flex flex-col gap-2">
                  <h2 className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">
                    היסטוריה ({done.length})
                  </h2>
                  <ul className="flex flex-col gap-2">
                    {done.map((r) => (
                      <ReminderItem key={r.id} reminder={r} />
                    ))}
                  </ul>
                </section>
              )}
            </>
          )}
        </div>
      </div>
    </>
  )
}
