import { NextResponse, type NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth"
import { prisma } from "@/lib/db/prisma"
import { onboardingSchema } from "@/lib/validations/onboarding"
import { generateTasksForUser } from "@/lib/workflows/engine"
import type { Prisma } from "@prisma/client"

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId) {
    return NextResponse.json({ error: "לא מחובר" }, { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "בקשה לא תקינה" }, { status: 400 })
  }

  const parsed = onboardingSchema.safeParse(body)
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0]
    return NextResponse.json(
      { error: firstIssue?.message ?? "נתונים לא תקינים", issues: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const { fromAddress, toAddress, moveDate, answers } = parsed.data

  // Upsert household (one per user)
  const household = await prisma.household.upsert({
    where: { userId },
    create: {
      userId,
      fromAddress: fromAddress ?? null,
      toAddress,
      moveDate: new Date(moveDate),
    },
    update: {
      fromAddress: fromAddress ?? null,
      toAddress,
      moveDate: new Date(moveDate),
    },
  })

  // Upsert move profile (answers as JSON)
  await prisma.moveProfile.upsert({
    where: { householdId: household.id },
    create: { householdId: household.id, answers: answers as unknown as Prisma.InputJsonValue },
    update: { answers: answers as unknown as Prisma.InputJsonValue },
  })

  // Run workflow engine to generate personalized tasks
  const result = await generateTasksForUser(userId, household.id, answers)

  return NextResponse.json({
    success: true,
    householdId: household.id,
    tasks: result,
  })
}
