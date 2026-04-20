// Workflow definition shape (matches workflow JSON files)
export interface RequiredDocument {
  name: string
  description: string
  required: boolean
}

export interface ExternalLink {
  label: string
  url: string
  category: "official" | "info"
}

export interface CompletionRules {
  requiresDocuments?: boolean
  autoComplete?: boolean
}

export interface WorkflowStepDefinition {
  order: number
  title: string
  description: string
  /** Step-level conditions (AND-ed with workflow conditions). Omit or {} = always include. */
  triggerConditions?: Record<string, unknown>
  requiredDocuments?: RequiredDocument[]
  externalLinks?: ExternalLink[]
  helperNotes?: string
  /** Regulatory deadline in days after move date. Used to auto-create reminders. */
  deadlineDaysAfterMove?: number
  completionRules?: CompletionRules
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

export type LeadStatus = "NEW" | "FOLLOW_UP" | "QUOTED" | "BOOKED" | "WON" | "LOST"

export interface ClientRecord {
  id: string
  userId: string
  name: string
  phone: string
  source: string | null
  treatmentWanted: string | null
  notes: string | null
  createdAt: Date
  updatedAt: Date
}

export interface LeadRecord {
  id: string
  clientId: string
  status: LeadStatus
  aiSummary: string | null
  aiTags: string[]
  createdAt: Date
  updatedAt: Date
}

// Task with its workflow step context (used in UI)
export interface TaskWithStep {
  id: string
  status: TaskStatus
  dueDate: Date | null
  completedAt: Date | null
  notes: string | null
  workflowStep?: {
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
  } | null
}
