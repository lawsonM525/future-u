"use client"

import * as React from 'react'
import { GlowCard } from '@/components/ui/GlowCard'
import { Button } from '@/components/ui/button'
import { Plus, Minus, ExternalLink, RotateCcw, Trash2 } from 'lucide-react'
import { useSound } from '@/hooks/useSound'


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

  const { play } = useSound()

  const activeLimit = 10
  const completedPageSize = 20

  const loadActive = React.useCallback(async () => {
    setLoadingActive(true)
    setActiveError(null)
    try {
      const res = await fetch(`/api/quests?status=active&limit=${activeLimit}`, { cache: 'no-store' })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to load quests')
      const arr = Array.isArray(data.quests) ? (data.quests as unknown[]) : []
      const list: QuestItem[] = arr.map((item) => {
        const q = item as Record<string, unknown>
        return {
          _id: String(q._id ?? ''),
          title: String(q.title ?? ''),
          quantity: Number(q.quantity ?? 1),
          progress: Number(q.progress ?? 0),
          goalTitle: String(q.goalTitle ?? ''),
          goalYear: typeof q.goalYear === 'number' ? (q.goalYear as number) : null,
          explanation: typeof q.explanation === 'string' ? (q.explanation as string) : undefined,
        }
      })
      setActive(list)
    } catch (e: unknown) {
      setActiveError(e instanceof Error ? e.message : 'Failed to load quests')
    } finally {
      setLoadingActive(false)
    }
  }, [])

  const reopenQuest = async (q: QuestItem) => {
    try {
      // Set progress to quantity - 1 (at least 0) to make it active again
      const target = Math.max(0, (q.quantity ?? 1) - 1)
      const res = await fetch(`/api/quests/${q._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ progress: target })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to reopen quest')

      const updated: QuestItem = {
        _id: String(data.quest._id || q._id),
        title: String(data.quest.title || q.title),
        quantity: Number(data.quest.quantity || q.quantity || 1),
        progress: Number(data.quest.progress || target),
        goalTitle: String(data.quest.goalTitle || q.goalTitle || ''),
        goalYear: typeof data.quest.goalYear === 'number' ? data.quest.goalYear : (q.goalYear ?? null),
        explanation: typeof data.quest.explanation === 'string' ? data.quest.explanation : q.explanation,
        completedAt: null,
      }

      // Move from completed to active list
      setCompleted(prev => prev.filter(item => item._id !== q._id))
      setActive(prev => [updated, ...prev])

      // Notify others (DailyQuests) to refresh
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('quests:updated', { detail: { questId: q._id, action: 'reopened' } }))
      }
    } catch (e) {
      setCompletedError(e instanceof Error ? e.message : 'Failed to reopen quest')
    }
  }

  const deleteQuest = async (q: QuestItem) => {
    try {
      if (typeof window !== 'undefined') {
        const ok = window.confirm('Delete this quest permanently? This cannot be undone.')
        if (!ok) return
      }
      const res = await fetch(`/api/quests/${q._id}`, { method: 'DELETE' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'Failed to delete quest')

      // Remove from both lists just in case
      setCompleted(prev => prev.filter(item => item._id !== q._id))
      setActive(prev => prev.filter(item => item._id !== q._id))

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('quests:updated', { detail: { questId: q._id, action: 'deleted' } }))
      }
    } catch (e) {
      setCompletedError(e instanceof Error ? e.message : 'Failed to delete quest')
    }
  }

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
      const arr = Array.isArray(data.quests) ? (data.quests as unknown[]) : []
      const list: QuestItem[] = arr.map((item) => {
        const q = item as Record<string, unknown>
        return {
          _id: String(q._id ?? ''),
          title: String(q.title ?? ''),
          quantity: Number(q.quantity ?? 1),
          progress: Number(q.progress ?? 0),
          goalTitle: String(q.goalTitle ?? ''),
          goalYear: typeof q.goalYear === 'number' ? (q.goalYear as number) : null,
          explanation: typeof q.explanation === 'string' ? (q.explanation as string) : undefined,
          completedAt: q.completedAt ? String(q.completedAt) : null,
        }
      })

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
  React.useEffect(() => { loadCompleted() }, [loadCompleted])

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
    // Capture previous state to detect completion and play sounds
    const prevQuest = active.find(q => q._id === id)
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

      // Notify other components (e.g., DailyQuests) to refresh
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('quests:updated', { detail: { questId: id, delta, progress: Number(data.quest.progress || 0) } }))
      }

      // Play sound on increment and on completion
      const newProgress = Number(data.quest.progress || 0)
      const completedNow = !!(prevQuest && prevQuest.progress < prevQuest.quantity && newProgress >= prevQuest.quantity)
      if (delta > 0 || completedNow) {
        try { play('ding') } catch { /* noop */ }
      }
    } catch {
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

  // Premium-gated experience: show blurred teaser with brand colors and CTA
  // Removed premium check
  /* if (!isPremium) { ... } */

  return (
    <div className="space-y-6">
      <div className="px-1">
        <h1 className="mt-12 text-2xl md:text-3xl font-bold font-space-grotesk tracking-wide uppercase text-center">
          YOUR QUESTS
        </h1>
      </div>
      {loadingActive ? (
        <GlowCard className="p-8 text-center text-sm text-muted-foreground">Loading quests…</GlowCard>
      ) : activeError ? (
        <GlowCard className="p-8 text-center text-sm text-destructive">{activeError}</GlowCard>
      ) : active.length === 0 ? (
        <GlowCard className="p-8 text-center text-sm text-muted-foreground">
          No daily quests yet. Set goals to get your first quests!
        </GlowCard>
      ) : (
        <div className="space-y-6">
          {active.map((q) => {
            const pct = q.quantity > 0 ? Math.min(100, (q.progress / q.quantity) * 100) : 0
            return (
              <GlowCard key={q._id} className="p-6">
                <div className="flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-lg font-semibold">{q.title}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">Progress: {q.progress} / {q.quantity}</div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <Button size="sm" variant="outline" aria-label="decrement" onClick={() => patchProgress(q._id, -1)} disabled={q.progress <= 0}>
                        <Minus className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="jonquil" aria-label="increment" onClick={() => patchProgress(q._id, +1)} disabled={q.progress >= q.quantity}>
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-sm">
                    <div className="text-muted-foreground">Helping achieve:</div>
                    <div className="font-medium">{q.goalTitle}{typeof q.goalYear === 'number' ? ` • Year ${q.goalYear}` : ''}</div>
                  </div>
                  {q.explanation && (
                    <div className="text-sm text-foreground/90">{q.explanation}</div>
                  )}
                  <div className="h-2.5 w-full rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full bg-jonquil" style={{ width: pct + '%'}} />
                  </div>
                  <div className="flex justify-center">
                    <Button size="sm" variant="jonquil" onClick={() => openResources(q)}>
                      Find resources for this quest
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </GlowCard>
            )
          })}
        </div>
      )}

      <GlowCard className="p-5">
        <div className="text-lg font-semibold">Completed</div>
        <div className="mt-4 space-y-2">
          {completed.map(q => (
            <div key={q._id} className="rounded-md p-3 bg-white/5">
              <div className="flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <div className="font-medium truncate">{q.title}</div>
                  <div className="text-xs text-muted-foreground truncate">{q.goalTitle}</div>
                </div>
                <div className="shrink-0 flex items-center gap-2">
                  <div className="text-xs text-muted-foreground">{q.quantity} / {q.quantity}</div>
                  <Button size="sm" variant="outline" aria-label="Reopen quest" onClick={() => reopenQuest(q)}>
                    <RotateCcw className="w-4 h-4" />
                    <span className="sr-only">Reopen</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-plum-web text-black border-transparent hover:bg-plum-web/90 focus-visible:ring-plum-web/60"
                    aria-label="Delete quest"
                    onClick={() => deleteQuest(q)}
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
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
                      {r.favicon && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={r.favicon} alt="" className="w-4 h-4 rounded-sm" />
                      )}
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
