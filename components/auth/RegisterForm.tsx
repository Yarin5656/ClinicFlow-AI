"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { signIn } from "next-auth/react"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { registerSchema, type RegisterInput } from "@/lib/validations/auth"

export function RegisterForm({ locale }: { locale?: string }) {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "" },
  })

  const onSubmit = async (data: RegisterInput) => {
    setServerError(null)

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string }
      setServerError(body.error ?? "אירעה שגיאה. נסה שוב.")
      return
    }

    // Auto sign-in after successful register
    const signInRes = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    })

    if (signInRes?.error) {
      setServerError("החשבון נוצר אך ההתחברות האוטומטית נכשלה. נסה להתחבר ידנית.")
      router.push("/login")
      return
    }

    router.push("/onboarding")
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <Input
        label="שם מלא"
        placeholder="ישראל ישראלי"
        autoComplete="name"
        required
        error={errors.name?.message}
        {...register("name")}
      />
      <Input
        label="אימייל"
        type="email"
        placeholder="name@example.com"
        autoComplete="email"
        dir="ltr"
        className="text-right"
        required
        error={errors.email?.message}
        {...register("email")}
      />
      <Input
        label="סיסמה"
        type="password"
        placeholder="לפחות 8 תווים"
        autoComplete="new-password"
        required
        error={errors.password?.message}
        hint="לפחות 8 תווים"
        {...register("password")}
      />

      {serverError && (
        <div
          role="alert"
          className="rounded-md bg-[var(--color-warning-surface)] text-[var(--color-warning)] px-3 py-2 text-sm"
        >
          {serverError}
        </div>
      )}

      <Button type="submit" size="lg" loading={isSubmitting} className="mt-2">
        יצירת חשבון
      </Button>
    </form>
  )
}
