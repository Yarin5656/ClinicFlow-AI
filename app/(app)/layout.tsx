import { Sidebar } from "@/components/layout/Sidebar"
import { ReminderBell } from "@/components/layout/ReminderBell"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Floating bell, sits over the PageHero (dark). Glass pill auto-styles for the dark bg. */}
        <div className="absolute top-5 left-6 z-20">
          <ReminderBell />
        </div>

        {children}
      </main>
    </div>
  )
}
