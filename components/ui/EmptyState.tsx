import { cn } from "@/lib/utils"
import { Button } from "./Button"

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description: string
  action?: { label: string; onClick: () => void }
  className?: string
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center text-center gap-4 py-16 px-6", className)}>
      {icon && <div className="text-muted-foreground opacity-50 text-5xl">{icon}</div>}
      <div className="flex flex-col gap-2 max-w-[360px]">
        <h3 className="text-lg font-medium text-[var(--color-text)]">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
      {action && <Button onClick={action.onClick} size="md">{action.label}</Button>}
    </div>
  )
}
