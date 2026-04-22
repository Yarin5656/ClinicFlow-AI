"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { signIn } from "next-auth/react"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { loginSchema, type LoginInput } from "@/lib/validations/auth"
import { useTranslations } from "next-intl"

export function LoginForm({ locale }: { locale?: string }) {
  const t = useTranslations("auth")
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard"
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  const onSubmit = async (data: LoginInput) => {
    setServerError(null)

    const res = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    })

    if (res?.error) {
      setServerError("אימייל או סיסמה שגויים")
      return
    }

    router.push(callbackUrl)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <Input
        label={t("email")}
        type="email"
        placeholder={t("emailPlaceholder")}
        autoComplete="email"
        dir="ltr"
        className="text-right"
        required
        error={errors.email?.message}
        {...register("email")}
      />
      <Input
        label={t("password")}
        type="password"
        placeholder={t("passwordPlaceholder")}
        autoComplete="current-password"
        required
        error={errors.password?.message}
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
        {isSubmitting ? t("loggingIn") : t("submit")}
      </Button>
    </form>
  )
}
