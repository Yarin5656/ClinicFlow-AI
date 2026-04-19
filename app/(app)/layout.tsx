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
        {/* Floating utilities (reminder bell, etc.) — absolutely positioned over PageHero */}
        <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
          <div
            className="rounded-full bg-white/10 backdrop-blur-sm border border-white/10 p-1"
          >
            <ReminderBell />
          </div>
        </div>

        {children}
      </main>
    </div>
  )
}
