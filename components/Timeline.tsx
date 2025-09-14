"use client"
import { TimelineCheckpoint } from '@/types/timeline'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { GlowCard } from '@/components/ui/GlowCard'
import { Button } from '@/components/ui/button'
import { motion, useInView } from 'framer-motion'
import * as React from 'react'
import { Plus, Share2 } from 'lucide-react'
import { useSound } from '@/hooks/useSound'

interface TimelineProps {
  checkpoints: TimelineCheckpoint[]
  onShare?: (title: string, text: string) => void
}

function useShare() {
  return React.useCallback(async (title: string, text: string) => {
    const shareData = { title, text }
    if (navigator.share) {
      try { await navigator.share(shareData) } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(`${title}\n${text}`)
        // Optionally toast here
      } catch {}
    }
  }, [])
}

async function addGoalFromCheckpoint(cp: TimelineCheckpoint) {
  try {
    await fetch('/api/goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: cp.title, description: cp.description ?? '', checkpointYear: cp.year })
    })
  } catch {}
}

export function Timeline({ checkpoints, onShare }: TimelineProps) {
  const fallbackShare = useShare()
  // Track when legacy timeline is viewed
  React.useEffect(() => {
    try {
      if (checkpoints?.length && typeof window !== 'undefined' && typeof window.datafast === 'function') {
        window.datafast('timeline_viewed', { component: 'timeline_legacy' })
      }
    } catch {}
  }, [checkpoints?.length])

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
      <aside className="md:col-span-3">
        <div className="sticky top-20">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-bold text-accent">Your Journey</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {checkpoints.map((cp, i) => (
                  <div key={cp.year} className="flex items-center gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent/70" />
                    <span className="text-muted-foreground">{cp.year}</span>
                    <span className="truncate">{cp.title}</span>
                    {i === checkpoints.length - 1 && (
                      <span className="ml-auto px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 text-xs">Hero</span>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </aside>
      <section className="md:col-span-9 space-y-4">
        {checkpoints.map((cp, i) => (
          <TimelineItem key={`${cp.year}-${i}`} cp={cp} onShare={onShare ?? fallbackShare} />
        ))}
      </section>
    </div>
  )
}

function TimelineItem({ cp, onShare }: { cp: TimelineCheckpoint; onShare: (title: string, text: string) => void }) {
  const ref = React.useRef<HTMLDivElement | null>(null)
  const inView = useInView(ref, { amount: 0.2, once: true })
  const [expanded, setExpanded] = React.useState(false)
  const openedOnceRef = React.useRef(false)
  const { play } = useSound()
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 12 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4 }}
    >
      <GlowCard className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-accent">{cp.year}</span>
              <span className="text-xl font-semibold">{cp.title}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {cp.description}
            </p>
            {expanded && (
              <div className="text-sm text-muted-foreground mt-2">
                {cp.description}
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="jonquil"
              className="gap-1 rounded-full px-4 font-bold text-black text-base"
              onClick={() => { play('plop', 0.45); addGoalFromCheckpoint(cp) }}
            >
              <Plus className="w-4 h-4" /> Add to Goals
            </Button>
            <Button size="sm" variant="outline" onClick={() => onShare(cp.title, cp.description ?? '')} className="gap-1">
              <Share2 className="w-4 h-4" /> Share
            </Button>
          </div>
        </div>
        <div className="mt-2">
          <Button variant="ghost" size="sm" onClick={() => {
            setExpanded(v => {
              const next = !v
              if (next && !openedOnceRef.current) {
                try {
                  if (typeof window !== 'undefined' && typeof window.datafast === 'function') {
                    window.datafast('timeline_opened', { year: String(cp.year), title: (cp.title || '').slice(0, 255) })
                  }
                } catch {}
                openedOnceRef.current = true
              }
              return next
            })
          }}>
            {expanded ? 'Show less' : 'Expand'}
          </Button>
        </div>
      </GlowCard>
    </motion.div>
  )
}
