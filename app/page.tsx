import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth"
import { HeroMockup } from "@/components/landing/HeroMockup"

export const metadata: Metadata = {
  title: "ClinicFlow AI — Back Office לקליניקות אסתטיקה",
  description: "back office חכם לקליניקות אסתטיקה",
}

export default async function HomePage() {
  const session = await getServerSession(authOptions)
  if (session) redirect("/dashboard")

  return (
    <main className="min-h-screen bg-surface">
      {/* ─── Navigation ──────────────────────────────────────── */}
      <nav className="h-16 border-b border-border bg-surface-raised">
        <div className="max-w-6xl mx-auto h-full px-6 flex items-center justify-between">
          <Link href="/" className="font-display text-xl font-bold text-primary">
            ClinicFlow <span className="text-muted-foreground font-medium text-sm">AI</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-muted-foreground hover:text-[var(--color-text)] px-3 py-2 transition-colors"
            >
              התחברות
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary-hover transition-colors"
            >
              התחל בחינם
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── Hero ────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-highlight-soft)] to-transparent pointer-events-none" aria-hidden />
        <div className="relative max-w-6xl mx-auto px-6 py-16 lg:py-24 grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Copy */}
          <div className="animate-fade-in">
            <div className="inline-flex items-center gap-2 rounded-full bg-highlight-soft text-[var(--color-highlight)] px-3 py-1 text-xs font-semibold mb-5 border border-[var(--color-highlight)]/15">
              <span aria-hidden>✨</span>
              בנוי לקליניקות אסתטיקה בישראל
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-[4.2rem] font-bold text-primary leading-[1.08] mb-5 tracking-tight">
              הקליניקה שלך.
              <br />
              כל ליד.
              <br />
              <span className="relative inline-block text-[var(--color-highlight)]">
                בלי להיאבד.
                <svg
                  viewBox="0 0 320 14"
                  preserveAspectRatio="none"
                  aria-hidden
                  className="absolute -bottom-1.5 right-0 w-full h-3 text-[var(--color-highlight)]"
                >
                  <path
                    d="M2 8 Q 80 2, 160 8 T 318 6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>

            <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-lg">
              ClinicFlow AI עוקב אחרי כל פנייה, יוצר משימות follow-up אוטומטיות, ומוודא שאף ליד לא נופל בין הכיסאות.
            </p>

            <div className="flex items-center gap-3 flex-wrap mb-6">
              <Link
                href="/register"
                className="inline-flex items-center justify-center h-12 px-6 rounded-lg bg-highlight text-highlight-foreground font-semibold text-base hover:bg-highlight-hover transition-all active:scale-[0.98] shadow-card"
              >
                התחל בחינם
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center h-12 px-6 rounded-lg border-2 border-border bg-surface-raised text-[var(--color-text)] font-medium text-base hover:border-[var(--color-muted-fg)] transition-colors"
              >
                איך זה עובד?
              </a>
            </div>

            <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-1.5">
                <span className="text-[var(--color-highlight)]" aria-hidden>✓</span>
                follow-up אוטומטי לכל ליד
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-[var(--color-highlight)]" aria-hidden>✓</span>
                סיכום AI לכל פנייה
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-[var(--color-highlight)]" aria-hidden>✓</span>
                דשבורד בזמן אמת
              </li>
            </ul>
          </div>

          {/* Mockup */}
          <div className="animate-slide-up">
            <HeroMockup />
          </div>
        </div>
      </section>

      {/* ─── How it works ────────────────────────────────────── */}
      <section id="how-it-works" className="py-16 lg:py-24 border-t border-border">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl lg:text-4xl font-bold text-primary mb-3">
              שלושה צעדים ואתה בשליטה
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              במקום לאבד לידים בין הודעות וטלפונים, נוצר לך workflow ברור לכל פנייה.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                num: "01",
                title: "ליד נכנס — נרשם אוטומטית",
                desc: "כל פנייה — ווטסאפ, אינסטגרם, טלפון — נרשמת, מסוכמת ומסווגת על ידי ה-AI. פחות מדקה.",
              },
              {
                num: "02",
                title: "המערכת בונה תהליך follow-up",
                desc: "ClinicFlow AI יוצר אוטומטית משימות מעקב בזמנים הנכונים — בלי שתצטרך לזכור.",
              },
              {
                num: "03",
                title: "סגור עסקאות מהר יותר",
                desc: "ראה את כל הלידים בדשבורד אחד. מה בטיפול, מה חדש, מה נופל — הכל במקום אחד.",
              },
            ].map((step) => (
              <div
                key={step.num}
                className="bg-surface-raised rounded-xl border border-border p-6 hover:border-[var(--color-muted-fg)] hover:shadow-card-hover transition-all"
              >
                <div className="font-display text-3xl font-bold text-[var(--color-highlight)] mb-3 tabular-nums">
                  {step.num}
                </div>
                <h3 className="font-display text-lg font-medium text-[var(--color-text)] mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Dark stats banner ───────────────────────────────── */}
      <section className="bg-primary text-primary-foreground">
        <div className="max-w-6xl mx-auto px-6 py-16 lg:py-20">
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl lg:text-4xl font-bold mb-3">
              כל ליד. בלוח אחד.
            </h2>
            <p className="opacity-80 max-w-xl mx-auto">
              תפסיק לאבד פניות בין הודעות. זה כבר מאורגן בשבילך.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { stat: "40",  suffix: "%",  label: "לידים אובדים בלי follow-up" },
              { stat: "3",   suffix: "",   label: "תהליכי follow-up מובנים" },
              { stat: "5",   suffix: "",   label: "דקות להתחלה" },
              { stat: "0",   suffix: "₪",  label: "לחודש כרגע" },
            ].map((item) => (
              <div
                key={item.label}
                className="bg-[oklch(28%_0.04_40)] rounded-xl p-5 text-center border border-white/5"
              >
                <div className="font-display font-bold text-[var(--color-highlight)] mb-1 tabular-nums flex items-baseline justify-center gap-1">
                  <span className="text-4xl lg:text-5xl">{item.stat}</span>
                  {item.suffix && <span className="text-lg opacity-80">{item.suffix}</span>}
                </div>
                <div className="text-sm opacity-80">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── What makes us different ─────────────────────────── */}
      <section className="py-16 lg:py-24 border-t border-border bg-surface-raised/40">
        <div className="max-w-5xl mx-auto px-6">
          <div className="mb-12">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-highlight)] font-semibold mb-3">
              לא עוד spreadsheet ידני
            </p>
            <h2 className="font-display text-3xl lg:text-4xl font-bold text-primary tracking-tight max-w-2xl">
              ClinicFlow AI לא מחקה CRM רגיל. הוא בנוי סביב <span className="text-[var(--color-highlight)]">הקליניקה שלך</span>.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                badge: "ניהול לידים",
                title: "כל פנייה נרשמת, מסוכמת ומסווגת",
                desc: "ה-AI קולט כל ליד, מסכם את הפנייה ומסווג לפי עניין — בלי עבודה ידנית.",
              },
              {
                badge: "Follow-up אוטומטי",
                title: "המערכת יוצרת משימות follow-up בלי שתצטרך לזכור",
                desc: "3 תהליכי follow-up מובנים מראש. ClinicFlow AI יודעת מתי לתזכר ומה להגיד.",
              },
              {
                badge: "סיכום AI",
                title: "כל ליד מגיע עם תקציר חכם של הפנייה",
                desc: "חוסך זמן פתיחת שיחה מחדש — כל הקשר הפנייה נגיש בלחיצה אחת.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="bg-surface-raised rounded-2xl border border-border p-6 hover:border-[var(--color-highlight)]/40 hover:shadow-card-hover transition-all relative"
              >
                <div className="inline-flex items-center text-[10px] uppercase tracking-wider font-bold bg-highlight-soft text-[var(--color-highlight)] px-2 py-0.5 rounded mb-4">
                  {f.badge}
                </div>
                <h3 className="font-display text-lg font-semibold text-[var(--color-text)] mb-2 leading-snug">
                  {f.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features grid ───────────────────────────────────── */}
      <section className="py-16 lg:py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl lg:text-4xl font-bold text-primary mb-3">
              מה המערכת עושה בשבילך
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              4 יכולות מרכזיות שמוודאות שאף ליד לא נופל בין הכיסאות.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                icon: "📋",
                title: "ניהול לידים",
                desc: "כל פנייה נרשמת, מסוכמת ומסווגת — ווטסאפ, אינסטגרם, טלפון. הכל במקום אחד.",
              },
              {
                icon: "🔔",
                title: "Follow-up אוטומטי",
                desc: "המערכת יוצרת משימות follow-up בלי שתצטרך לזכור. 3 תהליכים מובנים מראש.",
              },
              {
                icon: "🤖",
                title: "סיכום AI",
                desc: "כל ליד מגיע עם תקציר חכם של הפנייה. חוסך זמן ומונע אי-הבנות.",
              },
              {
                icon: "📊",
                title: "דשבורד בזמן אמת",
                desc: "ראה מה חדש, מה בטיפול ומה נפל בין הכיסאות — כולם בלוח אחד.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="bg-surface-raised rounded-xl border border-border p-6 flex gap-4 hover:border-[var(--color-muted-fg)] hover:shadow-card-hover transition-all"
              >
                <div className="h-12 w-12 rounded-lg bg-highlight-soft flex items-center justify-center text-2xl shrink-0">
                  {f.icon}
                </div>
                <div>
                  <h3 className="font-display text-lg font-medium text-[var(--color-text)] mb-1.5">
                    {f.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Final CTA ───────────────────────────────────────── */}
      <section className="py-16 lg:py-24 border-t border-border">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="font-display text-3xl lg:text-4xl font-bold text-primary mb-4">
            הקליניקה הבאה שלך. מאורגנת.
          </h2>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            הרשמה בלחיצה. ה-onboarding לוקח דקה. אפשר להתחיל כבר עכשיו.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center justify-center h-14 px-8 rounded-lg bg-highlight text-highlight-foreground font-semibold text-lg hover:bg-highlight-hover transition-all active:scale-[0.98] shadow-card"
          >
            התחל בחינם
          </Link>
          <p className="mt-4 text-sm text-muted-foreground">
            כבר יש לך חשבון?{" "}
            <Link
              href="/login"
              className="text-accent hover:underline underline-offset-2 font-medium"
            >
              התחברות
            </Link>
          </p>
        </div>
      </section>

      {/* ─── Footer ──────────────────────────────────────────── */}
      <footer className="border-t border-border bg-surface-raised py-8">
        <div className="max-w-6xl mx-auto px-6 text-center text-xs text-muted-foreground">
          ClinicFlow AI — back office חכם לקליניקות אסתטיקה
        </div>
      </footer>
    </main>
  )
}
