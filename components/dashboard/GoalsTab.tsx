"use client"
import * as React from 'react'
import { GlowCard } from '@/components/ui/GlowCard'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useSound } from '@/hooks/useSound'

export type GoalItem = {
  _id: string
  title: string
  description?: string
  status: 'pending' | 'in_progress' | 'completed'
  checkpointYear?: number
}

export default function GoalsTab() {
  const [loading, setLoading] = React.useState(true)
  const [goals, setGoals] = React.useState<GoalItem[]>([])
  const [title, setTitle] = React.useState('')
  const [year, setYear] = React.useState<string>('')
  const [error, setError] = React.useState<string | null>(null)
  const { play } = useSound()

  const load = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/goals', { cache: 'no-store' })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.error || 'Failed to load goals')
      }
      setGoals(Array.isArray(data.goals) ? data.goals : [])
    } catch (e: any) {
      setError(e?.message || 'Failed to load goals')
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => { load() }, [load])

  const total = goals.length
  const completed = goals.filter(g => g.status === 'completed').length
  const progress = total > 0 ? (completed / total) * 100 : 0

  async function addGoal() {
    const t = title.trim()
    if (!t) return
    const y = year.trim()
    const body: any = { title: t }
    if (y) {
      const n = Number(y)
      if (Number.isFinite(n)) body.checkpointYear = n
    }
    const res = await fetch('/api/goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    if (res.ok) {
      setTitle('')
      setYear('')
      load()
    }
  }

  async function toggleComplete(goal: GoalItem) {
    const next = goal.status === 'completed' ? 'pending' : 'completed'
    const res = await fetch(`/api/goals/${goal._id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next })
    })
    if (res.ok) {
      if (next === 'completed') play('complete')
      load()
    }
  }

  const grouped = React.useMemo(() => {
    const map = new Map<string, GoalItem[]>()
    for (const g of goals) {
      const key = typeof g.checkpointYear === 'number' ? String(g.checkpointYear) : 'Anytime'
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(g)
    }
    const years = Array.from(map.keys()).filter(k => k !== 'Anytime').map(Number).sort((a, b) => a - b)
    const ordered: Array<[string, GoalItem[]]> = years.map(y => [String(y), map.get(String(y))!])
    if (map.has('Anytime')) ordered.push(['Anytime', map.get('Anytime')!])
    return ordered
  }, [goals])

  return (
    <div className="space-y-4">
      <GlowCard className="p-5">
        <div className="flex items-center gap-6">
          <div className="shrink-0">
            <ProgressRing progress={progress} size={140} strokeWidth={12} progressColor="#fdca00" />
          </div>
          <div className="flex-1">
            <div className="text-xl font-semibold">Your Goals Progress</div>
            <div className="text-sm text-muted-foreground mt-1">
              {completed} of {total} goals completed
            </div>
            <div className="mt-4 flex flex-col sm:flex-row gap-2">
              <div className="flex-1 flex gap-2">
                <Input
                  placeholder="Add a goal"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') addGoal() }}
                />
                <Input
                  placeholder="Year (optional)"
                  value={year}
                  inputMode="numeric"
                  onChange={(e) => setYear(e.target.value)}
                  className="w-36"
                />
              </div>
              <Button onClick={addGoal} className="shrink-0">Add</Button>
            </div>
            {error && <div className="text-sm text-destructive mt-2">{error}</div>}
          </div>
        </div>
      </GlowCard>

      <GlowCard className="p-5">
        <div className="space-y-4">
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading goals…</div>
          ) : goals.length === 0 ? (
            <div className="text-sm text-muted-foreground">No goals yet. Add your first one above.</div>
          ) : (
            grouped.map(([yearLabel, items]) => (
              <div key={yearLabel} className="space-y-2">
                <div className="text-sm uppercase tracking-wide text-muted-foreground">{yearLabel === 'Anytime' ? 'Anytime' : `Year ${yearLabel}`}</div>
                <div className="space-y-1">
                  {items.map(g => (
                    <label key={g._id} className="flex items-center gap-3 py-2 px-3 rounded-md hover:bg-white/5">
                      <input
                        type="checkbox"
                        checked={g.status === 'completed'}
                        onChange={() => toggleComplete(g)}
                        className="h-4 w-4 accent-[#fdca00] cursor-pointer"
                        aria-label={g.title}
                      />
                      <span className={"text-sm " + (g.status === 'completed' ? 'line-through text-muted-foreground' : '')}>{g.title}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </GlowCard>
    </div>
  )
}
