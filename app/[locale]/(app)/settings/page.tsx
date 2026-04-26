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
