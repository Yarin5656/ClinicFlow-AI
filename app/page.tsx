import Link from "next/link"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth"
import { KineticHero } from "@/components/landing/KineticHero"
import { ScrollReveal, ScrollRevealItem } from "@/components/landing/ScrollReveal"
import { AnimatedCounter } from "@/components/landing/AnimatedCounter"

export default async function HomePage() {
  const session = await getServerSession(authOptions)
  if (session) redirect("/dashboard")

  return (
    <main className="min-h-screen bg-surface overflow-hidden">
      {/* ─── Navigation ──────────────────────────────────────── */}
      <nav className="h-16 border-b border-border bg-surface-raised/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto h-full px-6 flex items-center justify-between">
          <Link href="/" className="font-display text-xl font-bold text-primary">
            MoveEasy <span className="text-muted-foreground font-medium text-sm">ישראל</span>
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
              התחל חינם
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── Hero — KINETIC ──────────────────────────────────── */}
      <KineticHero />

      {/* ─── How it works — staggered spring reveals ────────── */}
      <ScrollReveal as="section" className="py-16 lg:py-24 border-t border-border" stagger={0.12}>
        <div id="how-it-works" className="max-w-6xl mx-auto px-6">
          <ScrollRevealItem className="text-center mb-14">
            <h2 className="font-display text-3xl lg:text-5xl font-bold text-primary mb-3 tracking-tight">
              שלושה צעדים ואתה בשליטה
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-lg">
              במקום להסתבך עם אתרי ממשלה מיושנים וטפסים, נוצר לך workflow ברור.
            </p>
          </ScrollRevealItem>

          <div className="grid md:grid-cols-3 gap-6 relative">
            {/* Connector line (desktop only) */}
            <div
              className="hidden md:block absolute top-[42px] right-[12%] left-[12%] h-px -z-10"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, transparent 0%, var(--color-border) 20%, var(--color-border) 80%, transparent 100%)",
              }}
              aria-hidden
            />
            {[
              { num: "01", title: "ענה על 6 שאלות קצרות",  desc: "תאריך מעבר, עיר יעד, שוכר/בעלים, ילדים, רכב, תעסוקה. פחות מדקה." },
              { num: "02", title: "קבל רשימה אישית",     desc: "המערכת מייצרת אוטומטית את המשימות הרלוונטיות בדיוק עבורך — לא יותר ולא פחות." },
              { num: "03", title: "בצע במהירות",         desc: "לכל משימה: מסמכים נדרשים, לינק רשמי, הערות והעלאת קבצים — הכל במקום אחד." },
            ].map((step) => (
              <ScrollRevealItem key={step.num}>
                <div className="relative bg-surface-raised rounded-2xl border border-border p-6 hover:border-[var(--color-muted-fg)] hover:shadow-card-hover transition-all">
                  <div
                    className="font-display text-5xl font-bold mb-3 tabular-nums"
                    style={{
                      background:
                        "linear-gradient(135deg, var(--color-highlight) 0%, var(--color-accent) 100%)",
                      WebkitBackgroundClip: "text",
                      backgroundClip: "text",
                      color: "transparent",
                    }}
                  >
                    {step.num}
                  </div>
                  <h3 className="font-display text-xl font-medium text-[var(--color-text)] mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </ScrollRevealItem>
            ))}
          </div>
        </div>
      </ScrollReveal>

      {/* ─── Dark stats banner with animated counters ─────── */}
      <ScrollReveal
        as="section"
        className="relative overflow-hidden"
        stagger={0.1}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 30% 20%, oklch(35% 0.1 245), oklch(25% 0.08 245) 70%)",
          }}
          aria-hidden
        />
        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
          aria-hidden
        />
        <div className="relative max-w-6xl mx-auto px-6 py-20 lg:py-28 text-primary-foreground">
          <ScrollRevealItem className="text-center mb-12">
            <h2 className="font-display text-3xl lg:text-5xl font-bold mb-3 tracking-tight">
              כל המעבר. בלוח אחד.
            </h2>
            <p className="opacity-80 max-w-xl mx-auto text-lg">
              תפסיק לרדוף אחרי טפסים ואישורים. זה כבר מאורגן בשבילך.
            </p>
          </ScrollRevealItem>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { value: 3,  suffix: "",  label: "תהליכי מעבר" },
              { value: 12, suffix: "",  label: "משימות מסודרות" },
              { value: 16, suffix: "",  label: "לינקים רשמיים" },
              { value: 0,  suffix: "₪", label: "עלות שימוש" },
            ].map((item) => (
              <ScrollRevealItem key={item.label}>
                <div
                  className="rounded-2xl p-6 text-center relative overflow-hidden"
                  style={{
                    background: "oklch(30% 0.07 245 / 0.8)",
                    border: "1px solid oklch(45% 0.06 245 / 0.4)",
                  }}
                >
                  <div className="font-display text-5xl lg:text-6xl font-bold text-[var(--color-highlight)] mb-1 tabular-nums">
                    <AnimatedCounter value={item.value} suffix={item.suffix} />
                  </div>
                  <div className="text-sm opacity-80">{item.label}</div>
                </div>
              </ScrollRevealItem>
            ))}
          </div>
        </div>
      </ScrollReveal>

      {/* ─── Features ────────────────────────────────────────── */}
      <ScrollReveal as="section" className="py-16 lg:py-28" stagger={0.1}>
        <div className="max-w-6xl mx-auto px-6">
          <ScrollRevealItem className="text-center mb-14">
            <h2 className="font-display text-3xl lg:text-5xl font-bold text-primary mb-3 tracking-tight">
              למה צריך בכלל את זה?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-lg">
              כי מעבר דירה בישראל דורש לעדכן לפחות 10 גופים שונים. אין מקום אחד שמרכז את זה.
            </p>
          </ScrollRevealItem>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: "🏛️", title: "שינוי כתובת רשמית",  desc: "משרד הפנים, ביטוח לאומי, קופת חולים, בנק, רישיון נהיגה — כל שלב עם מסמכים ולינק ישיר." },
              { icon: "🏙️", title: "ארנונה עירונית",     desc: "הצהרת מעבר בעירייה החדשה, ביטול בישנה, בדיקת זכאות להנחות. גם לפי סוג המגורים." },
              { icon: "💰", title: "רשות המסים",        desc: "עדכון מס הכנסה, הודעה למעביד (לשכירים), מע״מ (לעצמאיים). המערכת יודעת מה רלוונטי אליך." },
              { icon: "📄", title: "מסמכים מאובטחים",    desc: "העלה חוזה, נסח טאבו, ת.ז. הכל במקום אחד. הורדה מהירה כשיוצאים לסניף." },
            ].map((f) => (
              <ScrollRevealItem key={f.title}>
                <div className="bg-surface-raised rounded-2xl border border-border p-6 flex gap-4 hover:border-[var(--color-muted-fg)] hover:shadow-card-hover transition-all group">
                  <div
                    className="h-14 w-14 rounded-xl flex items-center justify-center text-3xl shrink-0 group-hover:scale-110 transition-transform"
                    style={{ background: "var(--color-highlight-soft)" }}
                  >
                    {f.icon}
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-medium text-[var(--color-text)] mb-1.5">
                      {f.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {f.desc}
                    </p>
                  </div>
                </div>
              </ScrollRevealItem>
            ))}
          </div>
        </div>
      </ScrollReveal>

      {/* ─── Final CTA ───────────────────────────────────────── */}
      <ScrollReveal as="section" className="py-16 lg:py-28 border-t border-border" stagger={0.08}>
        <div className="max-w-3xl mx-auto px-6 text-center">
          <ScrollRevealItem>
            <h2 className="font-display text-3xl lg:text-5xl font-bold text-primary mb-4 tracking-tight">
              המעבר הבא שלך. מאורגן.
            </h2>
          </ScrollRevealItem>
          <ScrollRevealItem>
            <p className="text-muted-foreground mb-8 leading-relaxed text-lg">
              הרשמה בלחיצה. ה-onboarding לוקח דקה. אפשר להתחיל כבר עכשיו.
            </p>
          </ScrollRevealItem>
          <ScrollRevealItem>
            <Link
              href="/register"
              className="inline-flex items-center justify-center h-14 px-10 rounded-xl bg-[var(--color-highlight)] text-highlight-foreground font-semibold text-lg shadow-card hover:bg-[var(--color-highlight-hover)] active:scale-[0.98] transition-all"
            >
              יצירת חשבון חינם
            </Link>
          </ScrollRevealItem>
          <ScrollRevealItem>
            <p className="mt-4 text-sm text-muted-foreground">
              כבר יש לך חשבון?{" "}
              <Link href="/login" className="text-accent hover:underline underline-offset-2 font-medium">
                התחברות
              </Link>
            </p>
          </ScrollRevealItem>
        </div>
      </ScrollReveal>

      {/* ─── Footer ──────────────────────────────────────────── */}
      <footer className="border-t border-border bg-surface-raised py-8">
        <div className="max-w-6xl mx-auto px-6 text-center text-xs text-muted-foreground">
          MoveEasy Israel · כלי עזר לניהול מעבר דירה בישראל · לא מחליף ייעוץ משפטי
        </div>
      </footer>
    </main>
  )
}
