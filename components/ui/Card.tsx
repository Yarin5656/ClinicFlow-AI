import { cn } from "@/lib/utils"

interface CardProps {
  className?: string
  children: React.ReactNode
  as?: "div" | "article" | "section"
  padding?: "sm" | "md" | "lg"
  hoverable?: boolean
}

const paddingClasses = { sm: "p-4", md: "p-5", lg: "p-6" }

export function Card({ className, children, as: Tag = "div", padding = "md", hoverable = false }: CardProps) {
  return (
    <Tag className={cn(
      "bg-surface-raised rounded-lg border border-border shadow-card",
      hoverable && "cursor-pointer transition-shadow duration-200 hover:shadow-card-hover",
      paddingClasses[padding],
      className
    )}>
      {children}
    </Tag>
  )
}
