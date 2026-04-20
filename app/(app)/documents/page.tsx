import Link from "next/link"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth"
import { prisma } from "@/lib/db/prisma"
import { PageHero } from "@/components/layout/PageHero"
import { Card } from "@/components/ui/Card"
import { EmptyState } from "@/components/ui/EmptyState"
import { DocumentList } from "@/components/documents/DocumentList"
import { UploadZone } from "@/components/documents/UploadZone"

export const metadata = { title: "מסמכים — ClinicFlow AI" }

export default async function DocumentsPage() {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId) redirect("/login")

  const documents = await prisma.document.findMany({
    where: { userId },
    select: {
      id: true,
      filename: true,
      mimeType: true,
      sizeBytes: true,
      uploadedAt: true,
      docType: true,
      extractedFields: true,
      task: {
        select: {
          id: true,
          workflowStep: {
            select: {
              title: true,
              workflow: { select: { title: true, slug: true } },
            },
          },
        },
      },
    },
    orderBy: { uploadedAt: "desc" },
  })

  const normalizedDocs = documents.map((d) => ({
    ...d,
    extractedFields:
      d.extractedFields &&
      typeof d.extractedFields === "object" &&
      !Array.isArray(d.extractedFields)
        ? (d.extractedFields as Record<string, unknown>)
        : null,
  }))

  type NormalizedDoc = (typeof normalizedDocs)[number]
  type Group = {
    key: string
    title: string
    subtitle: string | null
    taskId: string | null
    docs: NormalizedDoc[]
  }
  const groupMap = new Map<string, Group>()

  for (const doc of normalizedDocs) {
    const key = doc.task?.id ?? "general"
    if (!groupMap.has(key)) {
      groupMap.set(key, {
        key,
        title: doc.task?.workflowStep?.title ?? "מסמכים כלליים",
        subtitle: doc.task?.workflowStep?.workflow.title ?? null,
        taskId: doc.task?.id ?? null,
        docs: [],
      })
    }
    groupMap.get(key)!.docs.push(doc)
  }
  const groups = Array.from(groupMap.values())

  return (
    <div className="flex-1 overflow-auto">
      <PageHero
        eyebrow="הארכיון שלך"
        title="המסמכים שלי"
        subtitle={
          <span>
            {documents.length}{" "}
            {documents.length === 1 ? "מסמך" : "מסמכים"} · מאובטח, רק לך
          </span>
        }
      />

      <div className="max-w-3xl mx-auto px-6 lg:px-8 py-8 lg:py-10 flex flex-col gap-5">
        <Card padding="lg">
          <h3 className="font-display text-base font-bold text-[var(--color-text)] mb-3">
            העלה מסמך חדש
          </h3>
          <UploadZone />
        </Card>

        {groups.length === 0 ? (
          <Card>
            <EmptyState
              icon="◫"
              title="עוד אין מסמכים"
              description="אפשר להעלות מסמך כאן, או להעלות מתוך משימה ספציפית."
            />
          </Card>
        ) : (
          groups.map((group) => (
            <section key={group.key} className="flex flex-col gap-2">
              <div className="flex items-baseline justify-between px-1">
                <div>
                  <h2 className="text-sm font-bold text-[var(--color-text)]">
                    {group.taskId ? (
                      <Link
                        href={`/tasks/${group.taskId}`}
                        className="hover:text-[var(--color-highlight)] transition-colors"
                      >
                        {group.title}
                      </Link>
                    ) : (
                      group.title
                    )}
                  </h2>
                  {group.subtitle && (
                    <p className="text-xs text-muted-foreground">
                      {group.subtitle}
                    </p>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  {group.docs.length}{" "}
                  {group.docs.length === 1 ? "מסמך" : "מסמכים"}
                </span>
              </div>
              <DocumentList documents={group.docs} />
            </section>
          ))
        )}
      </div>
    </div>
  )
}
