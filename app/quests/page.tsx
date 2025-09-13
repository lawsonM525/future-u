"use client"

import * as React from 'react'
import Link from 'next/link'
import { GlowCard } from '@/components/ui/GlowCard'
import { Button } from '@/components/ui/button'

type QuestItem = {
  _id: string
  title: string
  quantity: number
  progress: number
  goalTitle: string
  goalYear?: number | null
  explanation?: string
}

type ResourceItem = {
  title: string
  url: string
  snippet?: string
  favicon?: string
  image?: string
}

export default function QuestsPage() {
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [quests, setQuests] = React.useState<QuestItem[]>([])

  const [resOpen, setResOpen] = React.useState(false)
  const [resLoading, setResLoading] = React.useState(false)
  const [resError, setResError] = React.useState<string | null>(null)
  const [resources, setResources] = React.useState<ResourceItem[]>([])
  const [activeQuest, setActiveQuest] = React.useState<QuestItem | null>(null)

  React.useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/quests', { cache: 'no-store' })
        if (res.status === 401) {
          throw new Error('Please sign in to view your quests.')
        }
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
        if (mounted) setQuests(list)
      } catch (e: unknown) {
        if (mounted) setError(e instanceof Error ? e.message : 'Failed to load quests')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

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
    <div className="min-h-screen bg-night text-foreground p-6 md:p-10">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Quests</h1>
          <Link href="/dashboard" className="text-sm text-fluorescent-cyan hover:underline">Back to dashboard</Link>
        </div>

        {loading ? (
          <GlowCard className="p-8 text-center text-sm text-muted-foreground">Loading quests…</GlowCard>
        ) : error ? (
          <GlowCard className="p-8 text-center text-sm text-destructive">{error}</GlowCard>
        ) : quests.length === 0 ? (
          <GlowCard className="p-8 text-center text-sm text-muted-foreground">
            No daily quests yet. Set goals to get your first quests!
          </GlowCard>
        ) : (
          <div className="space-y-6">
            {quests.map((q) => {
              const pct = q.quantity > 0 ? Math.min(100, (q.progress / q.quantity) * 100) : 0
              return (
                <GlowCard key={q._id} className="p-6">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-lg font-semibold">{q.title}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">Progress: {q.progress} / {q.quantity}</div>
                      </div>
                      <Button variant="jonquil" onClick={() => openResources(q)}>Find resources for this quest</Button>
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
                  </div>
                </GlowCard>
              )
            })}
          </div>
        )}

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
    </div>
  )
}
