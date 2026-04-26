"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface Item { id: string; name: string; role?: string | null; address?: string | null; isActive: boolean }
interface Props {
  items: Item[]
  endpoint: string
  nameLabel: string
  secondaryLabel?: string
  secondaryKey?: "role" | "address"
}

const inputClass = "h-9 rounded-md border border-border bg-surface-raised px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"

export function StaffLocationsManager({ items, endpoint, nameLabel, secondaryLabel, secondaryKey }: Props) {
  const router = useRouter()
  const [name, setName] = useState("")
  const [secondary, setSecondary] = useState("")
  const [loading, setLoading] = useState(false)

  async function add() {
    if (!name.trim()) return
    setLoading(true)
    const body: Record<string, string> = { name }
    if (secondaryKey && secondary) body[secondaryKey] = secondary
    await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
    setName("")
    setSecondary("")
    setLoading(false)
    router.refresh()
  }

  async function remove(id: string) {
    await fetch(`${endpoint}/${id}`, { method: "DELETE" })
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <input className={inputClass} placeholder={nameLabel} value={name} onChange={e => setName(e.target.value)} />
        {secondaryLabel && (
          <input className={inputClass} placeholder={secondaryLabel} value={secondary} onChange={e => setSecondary(e.target.value)} />
        )}
        <button onClick={add} disabled={loading || !name.trim()} className="px-4 py-1.5 rounded-lg text-sm font-semibold text-white disabled:opacity-50" style={{ background: "var(--color-highlight)" }}>
          הוסף
        </button>
      </div>

      {items.length > 0 && (
        <div className="bg-surface-raised rounded-xl border border-border divide-y divide-border">
          {items.map(item => (
            <div key={item.id} className="flex items-center justify-between px-4 py-2.5 gap-4">
              <div>
                <p className="text-sm font-medium text-[var(--color-text)]">{item.name}</p>
                {secondaryKey && item[secondaryKey] && (
                  <p className="text-xs text-[var(--color-muted-fg)]">{item[secondaryKey]}</p>
                )}
              </div>
              <button onClick={() => remove(item.id)} className="text-xs text-red-400 hover:text-red-600 transition-colors">הסר</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
