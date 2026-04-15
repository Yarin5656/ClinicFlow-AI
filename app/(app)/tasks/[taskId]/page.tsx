export default function TaskDetailPage({ params }: { params: { taskId: string } }) {
  return (
    <div className="p-6">
      <p className="text-muted-foreground">פרטי משימה {params.taskId} — יתווסף בשלב 6</p>
    </div>
  )
}
