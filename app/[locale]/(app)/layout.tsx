import { Sidebar } from "@/components/layout/Sidebar"
import { ReminderBell } from "@/components/layout/ReminderBell"
import { BottomTabBar } from "@/components/layout/BottomTabBar"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="h-14 shrink-0 flex items-center justify-end px-6 border-b border-border bg-surface">
          <ReminderBell />
        </div>
        <div className="flex-1 overflow-auto pb-16 md:pb-0">
          {children}
        </div>
      </main>
      <BottomTabBar />
    </div>
  )
}
