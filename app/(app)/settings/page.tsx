import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth"
import { prisma } from "@/lib/db/prisma"
import { Header } from "@/components/layout/Header"
import { Card } from "@/components/ui/Card"
import { ProfileForm } from "@/components/settings/ProfileForm"

export const metadata = { title: "הגדרות — MoveEasy Israel" }

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId) redirect("/login")

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true, idNumber: true, phoneNumber: true, birthDate: true },
  })
  if (!user) redirect("/login")

  return (
    <>
      <Header
        title="הפרופיל שלי"
        subtitle="פרטים אישיים שיחסכו לך הקלדה חוזרת בכל משימה"
      />
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-2xl mx-auto flex flex-col gap-6">
          <Card padding="lg">
            <div className="mb-5">
              <h2 className="font-display text-lg font-medium text-[var(--color-text)] mb-1">
                פרטים אישיים
              </h2>
              <p className="text-sm text-muted-foreground">
                הנתונים פה לא נשלחים לאף גוף. הם רק משמשים אותך להעתקה מהירה
                כשאתה ממלא טפסים ממשלתיים.
              </p>
            </div>
            <ProfileForm defaults={user} />
          </Card>

          <Card padding="lg" className="bg-[var(--color-pending-surface)] border-[var(--color-pending)]/20">
            <div className="flex gap-3">
              <span className="text-xl shrink-0" aria-hidden>🔒</span>
              <div className="text-sm leading-relaxed">
                <strong className="block text-[var(--color-text)] mb-1">
                  פרטיות
                </strong>
                <span className="text-muted-foreground">
                  המידע שלך נשמר מקומית במסד הנתונים שלנו ולא משותף עם אף גוף
                  חיצוני. הסיסמה מוצפנת. המסמכים שלך נגישים רק לך.
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  )
}
