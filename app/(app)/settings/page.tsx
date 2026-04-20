import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth"
import { prisma } from "@/lib/db/prisma"
import { PageHero } from "@/components/layout/PageHero"
import { Card } from "@/components/ui/Card"
import { ProfileForm } from "@/components/settings/ProfileForm"

export const metadata = { title: "הגדרות — ClinicFlow AI" }

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId) redirect("/login")

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      email: true,
      idNumber: true,
      phoneNumber: true,
      birthDate: true,
    },
  })
  if (!user) redirect("/login")

  return (
    <div className="flex-1 overflow-auto">
      <PageHero
        eyebrow="הפרופיל האישי"
        title="הפרטים שלך"
        subtitle="מוזנים פעם אחת — מופיעים כהעתק-בלחיצה בכל משימה"
      />

      <div className="max-w-2xl mx-auto px-6 lg:px-8 py-8 lg:py-10 flex flex-col gap-5">
        {/* ID card-styled profile card */}
        <Card padding="lg" className="relative overflow-hidden">
          {/* Corner stamp */}
          <div
            aria-hidden
            className="absolute top-4 left-4 rotate-[-6deg] select-none"
          >
            <div
              className="border-[2.5px] rounded-md px-2 py-0.5"
              style={{
                borderColor: "oklch(50% 0.17 150)",
                color: "oklch(50% 0.17 150)",
                background:
                  "color-mix(in oklch, oklch(50% 0.17 150) 8%, transparent)",
              }}
            >
              <span className="font-display font-bold text-[11px] tracking-[0.08em]">
                ClinicFlow ·
                {user.idNumber ? ` ID ${user.idNumber.slice(-4)}` : " פרופיל"}
              </span>
            </div>
          </div>
          <div className="mb-5">
            <h2 className="font-display text-lg font-bold text-[var(--color-text)] mb-1">
              פרטים אישיים
            </h2>
            <p className="text-sm text-muted-foreground">
              הפרטים שלך — שם, אימייל וטלפון — מופיעים בפרופיל הקליניקה.
            </p>
          </div>
          <ProfileForm defaults={user} />
        </Card>

        <Card
          padding="lg"
          className="bg-[var(--color-pending-surface)] border-[var(--color-pending)]/20"
        >
          <div className="flex gap-3">
            <span className="text-xl shrink-0" aria-hidden>
              🔒
            </span>
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
  )
}
