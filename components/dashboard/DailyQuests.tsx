"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { Progress } from "@/components/ui/progress"
import { GlowCard } from "@/components/ui/GlowCard"
import { Target, Star, Zap } from "lucide-react"

type QuestItem = {
  _id: string
  title: string
  quantity: number
  progress: number
  goalTitle: string
}

const iconSet = [
  <Zap key="zap" className="w-4 h-4" />,
  <Target key="target" className="w-4 h-4" />,
  <Star key="star" className="w-4 h-4" />,
]

const colors = ["bg-jonquil", "bg-fluorescent-cyan", "bg-plum-web"] as const

// TODO: Make these more spaced out 
export function DailyQuests() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [quests, setQuests] = useState<QuestItem[]>([])

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/quests?status=active&limit=3', { cache: 'no-store' })
        const data = await res.json()
        if (!res.ok) throw new Error(data?.error || 'Failed to load quests')
        const rawArr = Array.isArray(data.quests) ? (data.quests as unknown[]) : []
        const raw: QuestItem[] = rawArr.map((item) => {
          const q = item as Record<string, unknown>
          return {
            _id: String(q._id ?? ''),
            title: String(q.title ?? ''),
            quantity: Number(q.quantity ?? 1),
            progress: Number(q.progress ?? 0),
            goalTitle: String(q.goalTitle ?? ''),
          }
        })
        // Client-side dedupe by normalized title, keep item with larger remaining
        const seen = new Map<string, QuestItem>()
        for (const q of raw) {
          const key = q.title.toLowerCase().replace(/\s+/g, ' ').trim()
          const remaining = q.quantity - q.progress
          const prev = seen.get(key)
          if (!prev || (prev.quantity - prev.progress) < remaining) {
            seen.set(key, q)
          }
        }
        const deduped = Array.from(seen.values()).slice(0, 3)
        if (mounted) setQuests(deduped)
      } catch (e: unknown) {
        if (mounted) setError(e instanceof Error ? e.message : 'Failed to load quests')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  return (
    <GlowCard className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Daily Quests</h3>
        <Link href="/dashboard?tab=quests" className="text-xs text-fluorescent-cyan hover:underline">View all</Link>
      </div>
      <div className="space-y-4">
        {loading ? (
          <div className="text-sm text-muted-foreground">Loading quests…</div>
        ) : error ? (
          <div className="text-sm text-destructive">{error}</div>
        ) : quests.length === 0 ? (
          <div className="text-sm text-muted-foreground" aria-live="polite">
            No daily quests yet. Set goals to get your first quests!
          </div>
        ) : (
          quests.map((q, i) => {
            const pct = q.quantity > 0 ? Math.min(100, (q.progress / q.quantity) * 100) : 0
            const color = colors[i % colors.length]
            const Icon = iconSet[i % iconSet.length]
            return (
              <div key={q._id} className="space-y-2 p-2 rounded-lg hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3 text-sm md:text-base">
                  <div className="w-7 h-7 grid place-items-center rounded-full bg-white/5 border border-border">
                    {Icon}
                  </div>
                  <span className="text-foreground/90">{q.title}</span>
                  <span className="ml-auto text-[11px] md:text-xs px-2 py-0.5 rounded-full bg-white/10 text-foreground/70 font-medium">
                    {q.progress} / {q.quantity}
                  </span>
                </div>
                <Progress value={pct} className="h-2.5 bg-white/10 rounded-full" indicatorClassName={color} />
              </div>
            )
          })
        )}
      </div>
    </GlowCard>
  )
}
