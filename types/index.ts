// Workflow definition shape (matches workflow JSON files)
export interface WorkflowStepDefinition {
  order: number
  title: string
  description: string
  requiredDocuments?: {
    name: string
    description: string
    required: boolean
  }[]
  externalLinks?: {
    label: string
    url: string
    category: "official" | "info"
  }[]
  helperNotes?: string
  completionRules?: {
    requiresDocuments?: boolean
    autoComplete?: boolean
  }
}

export interface WorkflowDefinition {
  slug: string
  title: string
  description: string
  triggerConditions?: Record<string, unknown>
  order?: number
  steps: WorkflowStepDefinition[]
}

// Onboarding wizard answers
export interface WizardAnswers {
  moveDate: string
  targetCity: string
  tenantType: "renter" | "owner"
  hasChildren: boolean
  hasCar: boolean
  employmentType: "employee" | "self-employed" | "other"
}

// Task status (mirrors Prisma enum)
export type TaskStatus = "PENDING" | "IN_PROGRESS" | "DONE" | "SKIPPED"

// Task with its workflow step context (used in UI)
export interface TaskWithStep {
  id: string
  status: TaskStatus
  dueDate: Date | null
  completedAt: Date | null
  notes: string | null
  workflowStep: {
    id: string
    order: number
    title: string
    description: string
    requiredDocuments: unknown
    externalLinks: unknown
    helperNotes: string | null
    workflow: {
      id: string
      slug: string
      title: string
    }
  }
}
