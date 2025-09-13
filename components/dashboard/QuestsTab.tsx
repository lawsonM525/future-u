"use client"

import * as React from 'react'
import { GlowCard } from '@/components/ui/GlowCard'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Plus, Minus, ExternalLink } from 'lucide-react'

export type QuestItem = {
  _id: string
  title: string
  quantity: number
  progress: number
  goalTitle: string
  goalYear?: number | null
  explanation?: string
  completedAt?: string | null
}

type ResourceItem = {
  title: string
  url: string
  snippet?: string
  favicon?: string
  image?: string
}

export default function QuestsTab() {
  const [loadingActive, setLoadingActive] = React.useState(true)
  const [activeError, setActiveError] = React.useState<string | null>(null)
  const [active, setActive] = React.useState<QuestItem[]>([])

  const [loadingCompleted, setLoadingCompleted] = React.useState(false)
  const [completedError, setCompletedError] = React.useState<string | null>(null)
  const [completed, setCompleted] = React.useState<QuestItem[]>([])
  const [cursor, setCursor] = React.useState<string | null>(null)
  const [hasMore, setHasMore] = React.useState(true)

  const [resOpen, setResOpen] = React.useState(false)
  const [resLoading, setResLoading] = React.useState(false)
  const [resError, setResError] = React.useState<string | null>(null)
  const [resources, setResources] = React.useState<ResourceItem[]>([])
  const [activeQuest, setActiveQuest] = React.useState<QuestItem | null>(null)

  const activeLimit = 10
  const completedPageSize = 20

  const loadActive = React.useCallback(async () => {
    setLoadingActive(true)
    setActiveError(null)
    try {
      const res = await fetch(`/api/quests?status=active&limit=${activeLimit}`, { cache: 'no-store' })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to load quests')
      const list: QuestItem[] = Array.isArray(data.quests) ? data.quests.map((q: any) => ({
        _id: String(q._id),
        title: String(q.title || ''),
        quantity: Number(q.quantity || 1),
        progress: Number(q.progress || 0),
        goalTitle: String(q.goalTitle || ''),
        goalYear: typeof q.goalYear === 'number' ? q.goalYear : null,
        explanation: typeof q.explanation === 'string' ? q.explanation : undefined,
      })) : []
      setActive(list)
    } catch (e: unknown) {
      setActiveError(e instanceof Error ? e.message : 'Failed to load quests')
    } finally {
      setLoadingActive(false)
    }
  }, [])

  const loadCompleted = React.useCallback(async () => {
    if (!hasMore || loadingCompleted) return
    setLoadingCompleted(true)
    setCompletedError(null)
    try {
      const url = new URL('/api/quests', window.location.origin)
      url.searchParams.set('status', 'completed')
      url.searchParams.set('limit', String(completedPageSize))
      if (cursor) url.searchParams.set('cursor', cursor)
      const res = await fetch(url.toString(), { cache: 'no-store' })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to load completed quests')
      const list: QuestItem[] = Array.isArray(data.quests) ? data.quests.map((q: any) => ({
        _id: String(q._id),
        title: String(q.title || ''),
        quantity: Number(q.quantity || 1),
        progress: Number(q.progress || 0),
        goalTitle: String(q.goalTitle || ''),
        goalYear: typeof q.goalYear === 'number' ? q.goalYear : null,
        explanation: typeof q.explanation === 'string' ? q.explanation : undefined,
        completedAt: q.completedAt ? String(q.completedAt) : null,
      })) : []

      setCompleted(prev => [...prev, ...list])
      if (list.length < completedPageSize) {
        setHasMore(false)
      } else {
        setCursor(list[list.length - 1]._id)
      }
    } catch (e: unknown) {
      setCompletedError(e instanceof Error ? e.message : 'Failed to load completed quests')
    } finally {
      setLoadingCompleted(false)
    }
  }, [cursor, hasMore, loadingCompleted])

  React.useEffect(() => { loadActive() }, [loadActive])
  React.useEffect(() => { loadCompleted() }, [])

  // Infinite scroll sentinel
  const sentinelRef = React.useRef<HTMLDivElement | null>(null)
  React.useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const io = new IntersectionObserver(entries => {
      const [entry] = entries
      if (entry.isIntersecting) {
        loadCompleted()
      }
    }, { root: null, rootMargin: '200px', threshold: 0 })
    io.observe(el)
    return () => io.disconnect()
  }, [loadCompleted])

  async function patchProgress(id: string, delta: number) {
    // Optimistic update
    setActive(prev => prev.map(q => q._id === id ? { ...q, progress: Math.max(0, Math.min(q.quantity, q.progress + delta)) } : q))
    try {
      const res = await fetch(`/api/quests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ delta })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to update quest')
      // Sync with server response
      setActive(prev => {
        const next = prev.map(q => q._id === id ? { ...q, progress: Number(data.quest.progress || 0) } : q)
        // Move to completed list if done
        const moved = next.filter(q => q._id === id && q.progress >= q.quantity)
        if (moved.length > 0) {
          // Remove from active and prepend to completed
          const remaining = next.filter(q => q._id !== id)
          setCompleted(c => [{ ...moved[0], completedAt: new Date().toISOString() }, ...c])
          return remaining
        }
        return next
      })
    } catch (e) {
      // Reload on error to stay consistent
      loadActive()
    }
  }

  async function openResources(quest: QuestItem) {
    setActiveQuest(quest)
    setResOpen(true)
    setResLoading(true)
    setResError(null)
    setResources([])
    try {
      const res = await fetch(`/api/quests/${quest._id}/resources`, { cache: 'no-store' })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to fetch resources')
      const list: ResourceItem[] = Array.isArray(data.resources) ? data.resources : []
      setResources(list)
    } catch (e: unknown) {
      setResError(e instanceof Error ? e.message : 'Failed to fetch resources')
    } finally {
      setResLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <GlowCard className="p-5">
        <div className="flex items-center justify-between">
          <div className="text-lg font-semibold">Active Quests</div>
          <a href="/quests" className="text-xs text-fluorescent-cyan hover:underline">Open full quests page</a>
        </div>
        <div className="mt-4 space-y-4">
          {loadingActive ? (
            <div className="text-sm text-muted-foreground">Loading…</div>
          ) : activeError ? (
            <div className="text-sm text-destructive">{activeError}</div>
          ) : active.length === 0 ? (
            <div className="text-sm text-muted-foreground">No active quests. Set goals to generate your first quests!</div>
          ) : (
            active.map(q => {
              const pct = q.quantity > 0 ? Math.min(100, (q.progress / q.quantity) * 100) : 0
              return (
                <div key={q._id} className="rounded-lg p-3 hover:bg-white/5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-medium truncate">{q.title}</div>
                      <div className="text-xs text-muted-foreground truncate">Helping achieve: {q.goalTitle}{typeof q.goalYear === 'number' ? ` • Year ${q.goalYear}` : ''}</div>
                      {q.explanation && (
                        <div className="text-xs text-foreground/80 mt-1 line-clamp-2">{q.explanation}</div>
                      )}
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <Button size="sm" variant="outline" aria-label="decrement" onClick={() => patchProgress(q._id, -1)} disabled={q.progress <= 0}>
                        <Minus className="w-4 h-4" />
                      </Button>
                      <div className="text-xs w-14 text-center">{q.progress} / {q.quantity}</div>
                      <Button size="sm" variant="jonquil" aria-label="increment" onClick={() => patchProgress(q._id, +1)} disabled={q.progress >= q.quantity}>
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-2">
                    <Progress value={pct} className="h-2.5 bg-white/10 rounded-full" />
                  </div>
                  <div className="mt-2">
                    <Button size="sm" variant="ghost" onClick={() => openResources(q)}>
                      Find resources for this quest
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </GlowCard>

      <GlowCard className="p-5">
        <div className="text-lg font-semibold">Completed</div>
        <div className="mt-4 space-y-2">
          {completed.map(q => (
            <div key={q._id} className="rounded-md p-3 bg-white/5">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <div className="font-medium truncate">{q.title}</div>
                  <div className="text-xs text-muted-foreground truncate">{q.goalTitle}</div>
                </div>
                <div className="text-xs text-muted-foreground">{q.quantity} / {q.quantity}</div>
              </div>
            </div>
          ))}
          {completedError && (
            <div className="text-sm text-destructive">{completedError}</div>
          )}
          {hasMore && (
            <div ref={sentinelRef} className="text-xs text-muted-foreground py-4 text-center">Loading more…</div>
          )}
          {!hasMore && completed.length === 0 && (
            <div className="text-sm text-muted-foreground">No completed quests yet.</div>
          )}
        </div>
      </GlowCard>

      {resOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70" role="dialog" aria-modal="true">
          <div className="w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-lg font-semibold">Resources for: {activeQuest?.title}</div>
                {activeQuest?.goalTitle && (
                  <div className="text-xs text-muted-foreground mt-0.5">Goal: {activeQuest.goalTitle}</div>
                )}
              </div>
              <Button variant="outline" onClick={() => setResOpen(false)}>Close</Button>
            </div>
            <div className="mt-4 min-h-[6rem]">
              {resLoading ? (
                <div className="text-sm text-muted-foreground">Searching resources…</div>
              ) : resError ? (
                <div className="text-sm text-destructive">{resError}</div>
              ) : resources.length === 0 ? (
                <div className="text-sm text-muted-foreground">No resources found yet.</div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {resources.map((r) => (
                    <a
                      key={r.url}
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/15 text-sm"
                      title={r.snippet || r.title}
                    >
                      {r.favicon && (<img src={r.favicon} alt="" className="w-4 h-4 rounded-sm" />)}
                      <span className="truncate max-w-[200px]">{r.title}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
