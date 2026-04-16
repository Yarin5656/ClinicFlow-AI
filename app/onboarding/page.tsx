import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth"
import { prisma } from "@/lib/db/prisma"
import { WizardShell } from "@/components/onboarding/WizardShell"

export const metadata = { title: "הגדרת מעבר — MoveEasy Israel" }

export default async function OnboardingPage() {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId) redirect("/login")

  // If user already completed onboarding, send them to the dashboard.
  const existing = await prisma.moveProfile.findFirst({
    where: { household: { userId } },
    select: { id: true },
  })
  if (existing) redirect("/dashboard")

  return <WizardShell />
}
