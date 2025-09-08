export default function QuestsPage() {
  return (
    <div className="min-h-screen bg-night text-foreground p-6 md:p-10">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Quests</h1>
          <a href="/dashboard" className="text-sm text-fluorescent-cyan hover:underline">Back to dashboard</a>
        </div>
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <p className="text-muted-foreground">Quests are coming soon. Complete daily tasks to earn XP and level up your Future U.</p>
        </div>
      </div>
    </div>
  )
}
