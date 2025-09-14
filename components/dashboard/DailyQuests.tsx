"use client"

import React, { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Progress } from "@/components/ui/progress"
import { GlowCard } from "@/components/ui/GlowCard"
import { Target, Star, Zap, Lock } from "lucide-react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"

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
  const { data: session } = useSession()
  const isPremium = session?.user?.subscriptionTier === 'premium'
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [quests, setQuests] = useState<QuestItem[]>([])
  const aliveRef = useRef(true)

  useEffect(() => {
    // Ensure correct value in React StrictMode where effects run twice in dev
    aliveRef.current = true
    return () => { aliveRef.current = false }
  }, [isPremium])

  const load = useCallback(async () => {
    if (!isPremium) {
      setQuests([])
      setLoading(false)
      return
    }
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
      if (aliveRef.current) setQuests(deduped)
    } catch (e: unknown) {
      if (aliveRef.current) setError(e instanceof Error ? e.message : 'Failed to load quests')
    } finally {
      if (aliveRef.current) setLoading(false)
    }
  }, [isPremium])

  useEffect(() => {
    load()
    if (!isPremium) return
    const handler = () => { load() }
    if (typeof window !== 'undefined') window.addEventListener('quests:updated', handler)
    return () => {
      if (typeof window !== 'undefined') window.removeEventListener('quests:updated', handler)
    }
  }, [load, isPremium])

  // Premium-gated card UI
  if (!isPremium) {
    return (
      <GlowCard className="relative overflow-hidden p-5 md:p-6 border-transparent">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Daily Quests</h3>
        </div>
        {/* Teaser content behind blur to show brand colors and realistic spacing */}
        <div aria-hidden className="space-y-4 md:space-y-5 select-none">
          {/* Colorful progress stripes */}
          <div className="space-y-2">
            <div className="h-2.5 w-full rounded-full bg-white/10 overflow-hidden">
              <div className="h-full bg-jonquil" style={{ width: '42%' }} />
            </div>
            <div className="h-2.5 w-10/12 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full bg-plum-web" style={{ width: '26%' }} />
            </div>
            <div className="h-2.5 w-11/12 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full bg-fluorescent-cyan" style={{ width: '62%' }} />
            </div>
          </div>

          {/* Ghost quest rows */}
          <div className="space-y-3">
            {[0,1,2].map((i) => (
              <div key={i} className="space-y-2 p-2 rounded-lg bg-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-white/10 border border-border" />
                  <div className="h-3 w-2/3 rounded bg-white/10" />
                  <div className="ml-auto h-5 w-16 rounded-full bg-white/10" />
                </div>
                <div className="h-2.5 w-full rounded-full bg-white/10 overflow-hidden">
                  <div className={`h-full ${i === 0 ? 'bg-jonquil' : i === 1 ? 'bg-fluorescent-cyan' : 'bg-plum-web'}`} style={{ width: i === 0 ? '38%' : i === 1 ? '54%' : '22%' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Overlay */}
        <div className="absolute inset-0 rounded-[inherit] bg-gradient-to-br from-night/10 via-night/40 to-night/60 backdrop-blur-md md:backdrop-blur-lg backdrop-saturate-150 p-5 md:p-6 grid place-items-center">
          <div className="text-center max-w-sm">
            <div className="inline-flex items-center gap-2 text-foreground/80">
              <Lock className="w-4 h-4" />
              <span className="text-xs uppercase tracking-wide">Premium Feature</span>
            </div>
            <h4 className="mt-2 text-lg font-semibold">Daily Quests</h4>
            <p className="mt-1.5 text-sm text-muted-foreground">Upgrade to unlock personalized daily quests, progress tracking, and helpful resources.</p>
            <div className="mt-4">
              <Button
                variant="jonquil"
                asChild
                onClick={() => {
                  try {
                    if (typeof window !== 'undefined' && typeof window.datafast === 'function') {
                      window.datafast('premium_feature_clicked', { feature: 'daily_quests_card', locked: 'true' })
                      window.datafast('pricing_opened')
                    }
                  } catch {}
                }}
              >
                <Link href="/account/subscription">Unlock Premium</Link>
              </Button>
            </div>
          </div>
        </div>
      </GlowCard>
    )
  }

  return (
    <GlowCard className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Daily Quests</h3>
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
              <Link
                key={q._id}
                href="/dashboard?tab=quests"
                aria-label={`Open quests tab to view ${q.title}`}
                className="block rounded-lg focus:outline-none focus:ring-2 focus:ring-jonquil/60"
                onClick={() => {
                  try {
                    if (typeof window !== 'undefined' && typeof window.datafast === 'function') {
                      window.datafast('premium_feature_clicked', { feature: 'daily_quests_card' })
                    }
                  } catch {}
                }}
              >
                <div className="space-y-2 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3 text-sm md:text-base">
                    <div className="w-7 h-7 grid place-items-center rounded-full bg-white/5 border border-border">
                      {Icon}
                    </div>
                    <span className="text-foreground/90 whitespace-nowrap">
                      {q.title.length > 22 ? q.title.slice(0, 21) + '…' : q.title}
                    </span>
                    <span className="ml-auto text-[11px] md:text-xs px-2 py-0.5 rounded-full bg-white/10 text-foreground/70 font-medium">
                      {q.progress} / {q.quantity}
                    </span>
                  </div>
                  <Progress value={pct} className="h-2.5 bg-white/10 rounded-full" indicatorClassName={color} />
                </div>
              </Link>
            )
          })
        )}
      </div>
    </GlowCard>
  )
}
