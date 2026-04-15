import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth"

export default async function HomePage() {
  const session = await getServerSession(authOptions)
  if (session) redirect("/dashboard")
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-surface px-4">
      <div className="text-center max-w-lg animate-fade-in">
        <h1 className="font-display text-4xl font-bold text-primary mb-4">MoveEasy Israel</h1>
        <p className="text-lg text-muted-foreground mb-8">כל הביורוקרטיה של מעבר הדירה — במקום אחד</p>
        <a href="/register" className="inline-flex items-center justify-center h-12 px-8 rounded-lg bg-primary text-primary-foreground font-medium text-base hover:bg-primary-hover transition-colors duration-150">
          התחל עכשיו
        </a>
        <p className="mt-4 text-sm text-muted-foreground">
          כבר יש לך חשבון?{" "}
          <a href="/login" className="text-accent hover:underline underline-offset-2">התחברות</a>
        </p>
      </div>
    </main>
  )
}
