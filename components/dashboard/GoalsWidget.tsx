"use client"
import * as React from 'react'
import { Button } from '@/components/ui/button'
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { GlowCard } from '@/components/ui/GlowCard'
import { useSound } from '@/hooks/useSound'
import { CheckCircle2, Circle, Plus, Trash2 } from 'lucide-react'

export type GoalItem = {
  _id: string
  title: string
  description?: string
  status: 'pending' | 'in_progress' | 'completed'
  checkpointYear?: number
}

export function GoalsWidget() {
  const [loading, setLoading] = React.useState(true)
  const [goals, setGoals] = React.useState<GoalItem[]>([])
  const [title, setTitle] = React.useState('')
  const { play } = useSound()

  const load = React.useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/goals', { cache: 'no-store' })
      const data = await res.json()
      if (res.ok) setGoals(data.goals)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => { load() }, [load])

  async function addGoal() {
    const t = title.trim()
    if (!t) return
    const res = await fetch('/api/goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: t })
    })
    if (res.ok) {
      setTitle('')
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

  async function remove(goal: GoalItem) {
    const res = await fetch(`/api/goals/${goal._id}`, { method: 'DELETE' })
    if (res.ok) load()
  }

  return (
    <GlowCard className="p-4" id="goals">
      <CardHeader className="p-0 pb-3">
        <CardTitle className="text-lg">Your Goals</CardTitle>
      </CardHeader>
      <CardContent className="p-0 space-y-3">
        <div className="flex gap-2">
          <Input
            placeholder="Add a goal"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') addGoal() }}
          />
          <Button onClick={addGoal} className="shrink-0">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="space-y-2">
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading...</div>
          ) : goals.length === 0 ? (
            <div className="text-sm text-muted-foreground">No goals yet.</div>
          ) : (
            goals.map(g => (
              <div key={g._id} className="flex items-center gap-3 py-2 px-3 rounded-lg border border-white/10 bg-card/40">
                <button onClick={() => toggleComplete(g)} className="text-accent">
                  {g.status === 'completed' ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                </button>
                <div className="flex-1 text-sm">
                  <div className={g.status === 'completed' ? 'line-through text-muted-foreground' : ''}>{g.title}</div>
                </div>
                <button onClick={() => remove(g)} className="text-muted-foreground hover:text-foreground">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </GlowCard>
  )
}

export default GoalsWidget
