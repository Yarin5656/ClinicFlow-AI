import { Header } from "@/components/layout/Header"
import { EmptyState } from "@/components/ui/EmptyState"

export default function DashboardPage() {
  return (
    <>
      <Header title="לוח הבקרה" subtitle="כל תהליכי המעבר שלך במקום אחד" />
      <div className="flex-1 p-6">
        <EmptyState
          icon="📋"
          title="טרם הגדרת את פרטי המעבר"
          description="השלם את אשף ה-onboarding כדי שנוכל לייצר עבורך רשימת משימות אישית."
          action={{ label: "בוא נתחיל", onClick: () => {} }}
        />
      </div>
    </>
  )
}
