"use client"

import type { FormField } from "@prisma/client"

const inputClass = "h-11 w-full rounded-xl border border-border bg-white/80 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-highlight)]"
const textareaClass = "w-full rounded-xl border border-border bg-white/80 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-highlight)] resize-none"

interface Props {
  field: FormField
  value: unknown
  onChange: (key: string, value: unknown) => void
}

type FieldOption = { label: string; value: string }

export function DynamicField({ field, value, onChange }: Props) {
  const options = (field.options as FieldOption[] | null) ?? []
  const strValue = String(value ?? "")

  const label = (
    <label className="text-sm font-medium text-[var(--color-text)]">
      {field.label}
      {field.isRequired && <span className="text-red-500 mr-1">*</span>}
    </label>
  )

  if (field.type === "textarea") {
    return (
      <div className="flex flex-col gap-1.5">
        {label}
        <textarea
          rows={3}
          required={field.isRequired}
          placeholder={field.placeholder ?? ""}
          className={textareaClass}
          value={strValue}
          onChange={e => onChange(field.key, e.target.value)}
        />
      </div>
    )
  }

  if (field.type === "select") {
    return (
      <div className="flex flex-col gap-1.5">
        {label}
        <select
          required={field.isRequired}
          className={inputClass}
          value={strValue}
          onChange={e => onChange(field.key, e.target.value)}
        >
          <option value="">{field.placeholder ?? "בחר..."}</option>
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
    )
  }

  if (field.type === "radio") {
    return (
      <div className="flex flex-col gap-2">
        {label}
        <div className="flex flex-col gap-1.5">
          {options.map(o => (
            <label key={o.value} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="radio"
                name={field.key}
                value={o.value}
                required={field.isRequired}
                checked={strValue === o.value}
                onChange={() => onChange(field.key, o.value)}
                className="accent-[var(--color-highlight)]"
              />
              {o.label}
            </label>
          ))}
        </div>
      </div>
    )
  }

  if (field.type === "checkbox") {
    const checked = Array.isArray(value) ? (value as string[]) : []
    return (
      <div className="flex flex-col gap-2">
        {label}
        <div className="flex flex-col gap-1.5">
          {options.map(o => (
            <label key={o.value} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                value={o.value}
                checked={checked.includes(o.value)}
                onChange={e => {
                  const next = e.target.checked
                    ? [...checked, o.value]
                    : checked.filter(v => v !== o.value)
                  onChange(field.key, next)
                }}
                className="accent-[var(--color-highlight)]"
              />
              {o.label}
            </label>
          ))}
        </div>
      </div>
    )
  }

  const inputType =
    field.type === "phone" ? "tel" :
    field.type === "number" ? "number" :
    field.type === "date" ? "date" : "text"

  return (
    <div className="flex flex-col gap-1.5">
      {label}
      <input
        type={inputType}
        required={field.isRequired}
        placeholder={field.placeholder ?? ""}
        className={inputClass}
        dir={field.type === "phone" ? "ltr" : undefined}
        value={strValue}
        onChange={e => onChange(field.key, e.target.value)}
      />
    </div>
  )
}
