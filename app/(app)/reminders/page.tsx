import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth"
import { prisma } from "@/lib/db/prisma"
import { PageHero } from "@/components/layout/PageHero"
import { Card } from "@/components/ui/Card"
import { EmptyState } from "@/components/ui/EmptyState"
import { CreateReminderForm } from "@/components/reminders/CreateReminderForm"
import {
  ReminderItem,
  type ReminderItemData,
} from "@/components/reminders/ReminderItem"

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
    else done.push(r)
  }

  return (
    <div className="flex-1 overflow-auto">
      <PageHero
        eyebrow="תזכורות · בתוך המערכת"
        title="מה הבא בתור?"
        subtitle={
          <span>
            {dueUnseen.length > 0 && (
              <>
                <span className="text-[var(--color-warning)] font-semibold">
                  {dueUnseen.length} דורשות טיפול
                </span>
                <span className="opacity-60 mx-2">·</span>
              </>
            )}
            {upcoming.length}{" "}
            {upcoming.length === 1 ? "עתידית" : "עתידיות"}
          </span>
        }
      />

      <div className="max-w-2xl mx-auto px-6 lg:px-8 py-8 lg:py-10 flex flex-col gap-5">
        <Card padding="lg">
          <h3 className="font-display text-base font-bold text-[var(--color-text)] mb-4">
            תזכורת חדשה
          </h3>
          <CreateReminderForm />
        </Card>

        {reminders.length === 0 ? (
          <Card>
            <EmptyState
              icon="◐"
              title="אין תזכורות עדיין"
              description="צור תזכורת כדי לא לשכוח משימה חשובה."
            />
          </Card>
        ) : (
          <>
            {dueUnseen.length > 0 && (
              <ReminderSection
                label="הגיע הזמן"
                tone="warning"
                items={dueUnseen}
              />
            )}
            {upcoming.length > 0 && (
              <ReminderSection
                label="עתידיות"
                tone="muted"
                items={upcoming}
              />
            )}
            {done.length > 0 && (
              <ReminderSection
                label="היסטוריה"
                tone="muted"
                items={done}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}

function ReminderSection({
  label,
  tone,
  items,
}: {
  label: string
  tone: "warning" | "muted"
  items: ReminderItemData[]
}) {
  const color =
    tone === "warning"
      ? "text-[var(--color-warning)]"
      : "text-muted-foreground"
  return (
    <section className="flex flex-col gap-2.5">
      <h2 className={`text-xs uppercase tracking-[0.18em] font-bold ${color}`}>
        {label} ({items.length})
      </h2>
      <ul className="flex flex-col gap-2.5">
        {items.map((r) => (
          <ReminderItem key={r.id} reminder={r} />
        ))}
      </ul>
    </section>
  )
}
