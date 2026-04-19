import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth"
import { redirect } from "next/navigation"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  const isAdmin = (session?.user as { isAdmin?: boolean })?.isAdmin ?? false
  if (!isAdmin) redirect("/dashboard")
  return <div className="min-h-screen p-6 bg-surface">{children}</div>
}
