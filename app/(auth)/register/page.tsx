import Link from "next/link"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth"
import { RegisterForm } from "@/components/auth/RegisterForm"

export const metadata = { title: "יצירת חשבון — MoveEasy Israel" }

export default async function RegisterPage() {
  const session = await getServerSession(authOptions)
  if (session) redirect("/dashboard")

  return (
    <main className="min-h-screen flex items-center justify-center bg-surface px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="inline-block font-display text-2xl font-bold text-primary mb-2"
          >
            MoveEasy Israel
          </Link>
          <h1 className="font-display text-xl text-[var(--color-text)] mb-1">
            יצירת חשבון חדש
          </h1>
          <p className="text-sm text-muted-foreground">
            מעבר דירה מסודר — במקום אחד
          </p>
        </div>

        <RegisterForm />

        <p className="mt-6 text-center text-sm text-muted-foreground">
          כבר יש לך חשבון?{" "}
          <Link href="/login" className="text-accent hover:underline underline-offset-2 font-medium">
            התחברות
          </Link>
        </p>
      </div>
    </main>
  )
}
