import Link from "next/link"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth"
import { prisma } from "@/lib/db/prisma"
import { Header } from "@/components/layout/Header"
import { Card } from "@/components/ui/Card"
import { EmptyState } from "@/components/ui/EmptyState"
import { DocumentList } from "@/components/documents/DocumentList"
import { UploadZone } from "@/components/documents/UploadZone"

export const metadata = { title: "המסמכים שלי — MoveEasy Israel" }

export default async function DocumentsPage() {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId) redirect("/login")

  const documents = await prisma.document.findMany({
    where: { userId },
    include: {
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

  // Group by task (or "general" if no task)
  type Group = {
    key: string
    title: string
    subtitle: string | null
    taskId: string | null
    docs: typeof documents
  }
  const groupMap = new Map<string, Group>()

  for (const doc of documents) {
    const key = doc.task?.id ?? "general"
    if (!groupMap.has(key)) {
      groupMap.set(key, {
        key,
        title: doc.task?.workflowStep.title ?? "מסמכים כלליים",
        subtitle: doc.task?.workflowStep.workflow.title ?? null,
        taskId: doc.task?.id ?? null,
        docs: [],
      })
    }
    groupMap.get(key)!.docs.push(doc)
  }
  const groups = Array.from(groupMap.values())

  return (
    <>
      <Header
        title="המסמכים שלי"
        subtitle={`סה"כ ${documents.length} ${documents.length === 1 ? "מסמך" : "מסמכים"}`}
      />
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-3xl mx-auto flex flex-col gap-6">
          <Card padding="lg">
            <h3 className="font-display text-base font-medium text-[var(--color-text)] mb-3">
              העלה מסמך חדש
            </h3>
            <UploadZone />
          </Card>

          {groups.length === 0 ? (
            <Card>
              <EmptyState
                icon="📂"
                title="עוד אין מסמכים"
                description="אפשר להעלות מסמך כאן, או להעלות מתוך משימה ספציפית."
              />
            </Card>
          ) : (
            groups.map((group) => (
              <section key={group.key} className="flex flex-col gap-2">
                <div className="flex items-baseline justify-between">
                  <div>
                    <h2 className="text-sm font-semibold text-[var(--color-text)]">
                      {group.taskId ? (
                        <Link
                          href={`/tasks/${group.taskId}`}
                          className="hover:text-primary transition-colors"
                        >
                          {group.title}
                        </Link>
                      ) : (
                        group.title
                      )}
                    </h2>
                    {group.subtitle && (
                      <p className="text-xs text-muted-foreground">{group.subtitle}</p>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {group.docs.length} {group.docs.length === 1 ? "מסמך" : "מסמכים"}
                  </span>
                </div>
                <DocumentList documents={group.docs} />
              </section>
            ))
          )}
        </div>
      </div>
    </>
  )
}
