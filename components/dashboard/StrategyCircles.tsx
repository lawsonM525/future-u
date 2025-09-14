"use client"

import React, { useEffect, useMemo, useRef, useState, useLayoutEffect, type ReactNode, useCallback } from "react"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { cn } from "@/lib/utils"
import type { TimelineCheckpoint } from "@/types/timeline"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Check, Loader2 } from "lucide-react"
import { useSound } from "@/hooks/useSound"
import AddGoalsModal from "@/components/dashboard/AddGoalsModal"
import { useSession } from "next-auth/react"

// Note: icons supply the visual accent; no additional color palette needed here

export function StrategyCircles({ checkpoints, positions, intro, isGenerating }: { checkpoints: TimelineCheckpoint[]; positions?: number[]; intro?: ReactNode; isGenerating?: boolean }) {
  const { data: session } = useSession()
  const items = useMemo(() => {
    const uniqueByYear = new Map<number, TimelineCheckpoint>()
    for (const c of checkpoints) {
      if (!uniqueByYear.has(c.year)) uniqueByYear.set(c.year, c)
    }
    return Array.from(uniqueByYear.values()).sort((a, b) => a.year - b.year)
  }, [checkpoints])

  // Allow multiple strategy details to remain open simultaneously
  const [openSet, setOpenSet] = useState<Set<number>>(new Set())
  // Track which years have been opened at least once (to stop pulsing hint)
  const [dismissedPulseYears, setDismissedPulseYears] = useState<Set<number>>(new Set())
  const { play } = useSound()

  // Modal state for adding goals
  const [modalOpen, setModalOpen] = useState(false)
  const [modalYear, setModalYear] = useState<number | undefined>(undefined)
  const [modalGoals, setModalGoals] = useState<string[] | undefined>(undefined)

  // measure container width to compute responsive offsets
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [containerWidth, setContainerWidth] = useState<number>(0)

  useLayoutEffect(() => {
    const update = () => {
      const w = containerRef.current?.clientWidth || 0
      setContainerWidth(w)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  // Persist dismissed pulse years across sessions
  useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem('dismissedPulseYears') : null
      if (raw) {
        const arr = JSON.parse(raw) as number[]
        if (Array.isArray(arr)) setDismissedPulseYears(new Set(arr))
      }
    } catch {}
  }, [])

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('dismissedPulseYears', JSON.stringify(Array.from(dismissedPulseYears)))
      }
    } catch {}
  }, [dismissedPulseYears])

  // Respect OS/browser reduced-motion preference for accessibility
  const reduceMotion = useReducedMotion()

  // DataFast helper
  const track = useCallback((goal: string, params?: Record<string, string | undefined>) => {
    try {
      if (typeof window !== 'undefined' && typeof window.datafast === 'function') {
        const cleaned: Record<string, string> = {}
        if (params) {
          for (const [k, v] of Object.entries(params)) {
            if (v !== undefined && v !== null) cleaned[k] = String(v)
          }
        }
        window.datafast(goal, cleaned)
      }
    } catch {}
  }, [])

  const getWeekKey = useCallback(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    const day = d.getDay()
    const diff = (day === 0 ? -6 : 1) - day
    d.setDate(d.getDate() + diff)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${dd}`
  }, [])

  // Fire timeline viewed and weekly revisit counters
  useEffect(() => {
    if (!items.length) return
    const user_id = session?.user?.id ? String(session.user.id) : undefined
    const email = session?.user?.email ? String(session.user.email) : undefined
    track('timeline_viewed', { user_id, email, component: 'strategy_circles' })
    try {
      const wk = getWeekKey()
      const countKey = `df_timeline_views_${wk}`
      const firedKey = `df_timeline_multi_${wk}`
      const current = Number((typeof window !== 'undefined' ? localStorage.getItem(countKey) : '0') || '0')
      const next = current + 1
      if (typeof window !== 'undefined') localStorage.setItem(countKey, String(next))
      if (next >= 2 && typeof window !== 'undefined' && !localStorage.getItem(firedKey)) {
        track('timeline_multi_views_week', { user_id, email, week: wk, count: String(next) })
        localStorage.setItem(firedKey, '1')
      }
    } catch {}
  }, [items.length, session, track, getWeekKey])

  if (!items.length) {
    if (isGenerating) {
      return (
        <div className="p-8 text-center space-y-3">
          <Loader2 className="h-6 w-6 animate-spin text-accent mx-auto" aria-hidden="true" />
          <p className="text-muted-foreground">Generating your timeline…</p>
        </div>
      )
    }
    return (
      <div className="p-8 text-center space-y-3">
        <p className="text-muted-foreground">No strategy yet. Take a quiz to generate your Career Strategy.</p>
        <Button asChild className="rounded-full">
          <Link href="/quiz-selection" onClick={() => play('plop', 0.35)}>Take Quiz to Get Started</Link>
        </Button>
      </div>
    )
  }

  // default offset curve if positions are not provided (normalized -1..1)
  const defaultNormalized = (index: number) => Math.sin(index * 1.1)

  return (
    <div ref={containerRef} className="relative max-w-3xl mx-auto py-10">

      <h1 className="text-3xl font-bold mb-6 text-center font-space-grotesk">YOUR STRATEGY</h1>
      {intro ? (
        <div className="mx-auto max-w-[42rem] text-center mb-8 space-y-4">
          {intro}
        </div>
      ) : null}
      <ul className="relative space-y-10 md:space-y-14 lg:space-y-16">
        {items.map((cp, i) => {
          const selected = openSet.has(i)
          const year = cp.year
          const shouldPulse2025 = year === 2025 && !selected && !dismissedPulseYears.has(2025)
          const hasAsset = year >= 2025 && year <= 2030
          const iconSrc = hasAsset ? `/buttons/${year}-${selected ? 'up' : 'flat'}.png` : null
          const norm = Math.max(-1, Math.min(1, positions?.[i] ?? defaultNormalized(i)))
          const maxOffset = Math.max(0, containerWidth * 0.35) // 35% of available width
          const offsetPx = norm * maxOffset

          const node = (
            <motion.button
              key={`node-${cp.year}`}
              onClick={() => {
                play('plop', 0.4)
                let openedNow = false
                setOpenSet((prev) => {
                  const next = new Set(prev)
                  if (next.has(i)) next.delete(i)
                  else { next.add(i); openedNow = true }
                  return next
                })
                // Track first open of any year
                try {
                  if (openedNow && typeof window !== 'undefined' && !localStorage.getItem('df_timeline_first_open')) {
                    const user_id = session?.user?.id ? String(session.user.id) : undefined
                    const email = session?.user?.email ? String(session.user.email) : undefined
                    track('timeline_opened', { user_id, email, year: String(cp.year), title: cp.title })
                    localStorage.setItem('df_timeline_first_open', '1')
                  }
                } catch {}
                // Mark this year as opened to stop pulsing in the future
                setDismissedPulseYears(prev => {
                  if (prev.has(year)) return prev
                  const next = new Set(prev)
                  next.add(year)
                  return next
                })
              }}
              whileHover={{ scale: 1.15, transition: { duration: 0.12, ease: [0.2, 0.8, 0.2, 1] } }}
              whileTap={{ scale: 0.96 }}
              animate={shouldPulse2025 ? { scale: [1, 1.08, 1] } : undefined}
              transition={shouldPulse2025 ? { duration: 1.6, repeat: Infinity, ease: 'easeInOut' } : undefined}
              className={cn(
                "relative z-10 grid place-items-center transform-gpu will-change-transform focus:outline-none",
                iconSrc ? "p-0" : "w-24 h-24"
              )}
              aria-expanded={selected}
              aria-label={`Year ${cp.year}: ${cp.title}`}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  e.preventDefault()
                  setOpenSet((prev) => {
                    const next = new Set(prev)
                    next.delete(i)
                    return next
                  })
                }
              }}
            >
              {iconSrc ? (
                <Image src={iconSrc} alt={`${cp.year} icon`} width={104} height={104} />
              ) : (
                <span className="text-lg font-semibold">{cp.year}</span>
              )}
            </motion.button>
          )

          return (
            <li key={cp.year} className="relative">
              <div className="relative flex justify-center">
                <div className="relative flex flex-col items-center">
                  {/* Offset only the circle node, not the text content */}
                  <div style={{ transform: `translateX(${offsetPx}px)` }}>
                    {node}
                  </div>
                  <AnimatePresence initial={false}>
                    {selected && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 12 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.18 }}
                        className="mt-4 w-full px-4"
                      >
                        {/* Keep the text centered in the middle column and constrain width */}
                        <div className="mx-auto max-w-[42rem] text-center break-words">
                          <div className="text-xl font-semibold mb-2">{cp.title}</div>
                          {cp.description ? (
                            <p className="text-base leading-relaxed text-foreground/90" style={{ textAlign: 'justify' }}>
                              {cp.description}
                            </p>
                          ) : null}
                          {Array.isArray(cp.items) && cp.items.length > 0 ? (
                            <ul className="mt-3 text-left space-y-2">
                              {cp.items.map((item, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <Check className="h-5 w-5 text-accent mt-0.5 shrink-0" aria-hidden="true" />
                                  <span className="flex-1 block text-base leading-relaxed text-foreground/90 text-justify">{item}</span>
                                </li>
                              ))}
                            </ul>
                          ) : null}
                          <div className="mt-4">
                            <motion.div
                              initial={{ scale: 1 }}
                              animate={reduceMotion ? { scale: 1 } : { scale: [1, 1.04, 1] }}
                              transition={reduceMotion ? { duration: 0 } : { duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                              whileHover={{ scale: reduceMotion ? 1.03 : 1.06 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <Button
                                variant="jonquil"
                                className="rounded-full px-5 font-bold text-black text-base"
                                onClick={() => {
                                  play('plop', 0.45)
                                  // Prepopulate with all items for this year
                                  const initial = Array.isArray(cp.items) && cp.items.length > 0
                                    ? cp.items
                                    : (cp.title ? [cp.title] : [""])
                                  setModalGoals(initial)
                                  setModalYear(cp.year)
                                  setModalOpen(true)
                                }}
                                aria-label={`Add ${cp.year} items to goals`}
                              >
                                Add to Goals
                              </Button>
                            </motion.div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
      {/* Add Goals Modal */}
      <AddGoalsModal
        open={modalOpen}
        defaultYear={modalYear}
        initialGoals={modalGoals}
        onClose={() => setModalOpen(false)}
        onSaved={() => {
          // No-op: GoalsTab will load from DB when user views it
        }}
      />
    </div>
  )
}
