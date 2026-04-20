const LEADS = [
  { name: "מיכל לוי",  treatment: "בוטוקס פנים",   status: "חדש",         statusColor: "#1d4ed8", statusBg: "#dbeafe" },
  { name: "אורי גולן",  treatment: "פילר שפתיים",   status: "follow-up",   statusColor: "#92400e", statusBg: "#fef3c7" },
  { name: "שרה אביב",  treatment: "הסרת שיער לייזר", status: "נקבע תור",   statusColor: "#166534", statusBg: "#dcfce7" },
  { name: "דן רוזן",   treatment: "טיפול פנים מלא",  status: "הצעת מחיר",  statusColor: "#6b21a8", statusBg: "#f3e8ff" },
]

export function HeroMockup() {
  return (
    <div className="relative w-full max-w-[460px] mx-auto lg:mr-0" dir="rtl">
      {/* Accent shadow */}
      <div
        aria-hidden
        className="absolute -z-10 inset-0 translate-x-4 translate-y-5 rounded-[24px]"
        style={{ background: "var(--color-highlight-soft)" }}
      />

      <div
        className="relative rounded-[24px] border border-border overflow-hidden shadow-card-hover"
        style={{ background: "var(--color-surface)", aspectRatio: "5 / 6" }}
      >
        {/* Mini app header */}
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{ background: "var(--color-primary)" }}
        >
          <div className="flex items-baseline gap-1.5">
            <span className="font-display font-bold text-sm" style={{ color: "var(--color-primary-fg)" }}>
              ClinicFlow
            </span>
            <span className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: "var(--color-highlight)" }}>
              AI
            </span>
          </div>
          <span className="text-[10px]" style={{ color: "oklch(65% 0.03 40)" }}>
            20 באפריל
          </span>
        </div>

        {/* Stat tiles */}
        <div className="grid grid-cols-2 gap-2.5 p-3.5 pb-2.5">
          <StatTile label="לידים חדשים" value="4" color="var(--color-highlight)" />
          <StatTile label="follow-ups" value="11" color="#d97706" />
        </div>

        {/* Section label */}
        <div className="px-3.5 pb-2">
          <span
            className="text-[9px] font-semibold uppercase tracking-widest"
            style={{ color: "var(--color-muted-fg)" }}
          >
            לידים אחרונים
          </span>
        </div>

        {/* Leads list */}
        <div
          className="mx-3.5 rounded-xl overflow-hidden border"
          style={{ borderColor: "var(--color-border)", background: "var(--color-surface-raised)" }}
        >
          {LEADS.map((row, i) => (
            <div
              key={row.name}
              className="flex items-center justify-between px-3 py-2.5"
              style={{
                borderBottom: i < LEADS.length - 1 ? "1px solid var(--color-border)" : "none",
              }}
            >
              <div>
                <p className="text-[11px] font-semibold" style={{ color: "var(--color-text)" }}>
                  {row.name}
                </p>
                <p className="text-[10px]" style={{ color: "var(--color-muted-fg)" }}>
                  {row.treatment}
                </p>
              </div>
              <span
                className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                style={{ background: row.statusBg, color: row.statusColor }}
              >
                {row.status}
              </span>
            </div>
          ))}
        </div>

        {/* New-lead notification — floats top-left (LTR left = visual right in RTL layout) */}
        <div
          className="absolute top-14 left-3 rounded-xl px-3 py-2"
          style={{
            background: "white",
            border: "1px solid var(--color-border)",
            boxShadow: "0 4px 16px oklch(18% 0.03 40 / 0.18)",
          }}
          aria-hidden
        >
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-[11px]" style={{ color: "var(--color-highlight)" }}>✦</span>
            <span className="text-[10px] font-bold" style={{ color: "var(--color-text)" }}>
              ליד חדש
            </span>
          </div>
          <p className="text-[9px]" style={{ color: "var(--color-muted-fg)" }}>
            רינת מזרחי · Instagram
          </p>
          <div
            className="mt-1.5 text-[8px] font-semibold px-1.5 py-0.5 rounded-full inline-block"
            style={{ background: "var(--color-highlight-soft)", color: "var(--color-highlight)" }}
          >
            3 משימות נוצרו
          </div>
        </div>
      </div>
    </div>
  )
}

function StatTile({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div
      className="rounded-xl p-3"
      style={{ background: "var(--color-surface-raised)", border: "1px solid var(--color-border)" }}
    >
      <p
        className="text-[9px] uppercase tracking-wider font-medium mb-1"
        style={{ color: "var(--color-muted-fg)" }}
      >
        {label}
      </p>
      <p className="font-display text-3xl font-bold tabular-nums" style={{ color }}>
        {value}
      </p>
    </div>
  )
}
