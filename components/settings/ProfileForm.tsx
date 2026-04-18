"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { updateProfileSchema, type UpdateProfileInput } from "@/lib/validations/profile"

interface Props {
  defaults: {
    name: string | null
    email: string
    idNumber: string | null
    phoneNumber: string | null
    birthDate: Date | null
  }
}

export function ProfileForm({ defaults }: Props) {
  const router = useRouter()
  const [savedAt, setSavedAt] = useState<number | null>(null)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: defaults.name ?? "",
      idNumber: defaults.idNumber ?? "",
      phoneNumber: defaults.phoneNumber ?? "",
      birthDate: defaults.birthDate ? defaults.birthDate.toISOString().slice(0, 10) : "",
    },
  })

  const onSubmit = async (data: UpdateProfileInput) => {
    setServerError(null)

    const res = await fetch("/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string }
      setServerError(body.error ?? "שגיאה בשמירה")
      return
    }

    setSavedAt(Date.now())
    router.refresh()
  }

  const savedRecently = savedAt !== null && Date.now() - savedAt < 2000

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <Input
        label="שם מלא"
        placeholder="ישראל ישראלי"
        autoComplete="name"
        error={errors.name?.message}
        {...register("name")}
      />

      <Input
        label="אימייל"
        type="email"
        value={defaults.email}
        disabled
        dir="ltr"
        className="text-right"
        hint="לא ניתן לשינוי כרגע"
      />

      <div className="grid sm:grid-cols-2 gap-4">
        <Input
          label="תעודת זהות"
          placeholder="9 ספרות"
          dir="ltr"
          className="text-right"
          maxLength={9}
          error={errors.idNumber?.message}
          hint="משמש להעתקה לטפסים"
          {...register("idNumber")}
        />

        <Input
          label="טלפון"
          placeholder="050-0000000"
          type="tel"
          dir="ltr"
          className="text-right"
          autoComplete="tel"
          error={errors.phoneNumber?.message}
          {...register("phoneNumber")}
        />
      </div>

      <Input
        label="תאריך לידה"
        type="date"
        error={errors.birthDate?.message}
        {...register("birthDate")}
      />

      {serverError && (
        <div
          role="alert"
          className="rounded-md bg-[var(--color-warning-surface)] text-[var(--color-warning)] px-3 py-2 text-sm"
        >
          {serverError}
        </div>
      )}

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" loading={isSubmitting}>
          שמור שינויים
        </Button>
        {savedRecently && (
          <span className="text-sm text-[var(--color-highlight)] animate-fade-in">
            ✓ נשמר
          </span>
        )}
      </div>
    </form>
  )
}
