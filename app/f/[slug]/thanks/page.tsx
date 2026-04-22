export default function ThanksPage() {
  return (
    <main
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background: "linear-gradient(135deg, oklch(96% 0.03 245) 0%, oklch(98% 0.02 10) 100%)",
      }}
    >
      <div className="text-center max-w-sm" dir="rtl">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 text-3xl mb-6">
          ✓
        </div>
        <h1 className="font-display text-2xl font-bold text-[var(--color-text)] mb-3">
          תודה!
        </h1>
        <p className="text-muted-foreground">
          קיבלנו את הפרטים שלך ונחזור אליך בקרוב.
        </p>
      </div>
    </main>
  )
}
