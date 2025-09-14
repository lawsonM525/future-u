"use client"

import React, { useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import type { TimelineCheckpoint } from "@/types/timeline"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Check } from "lucide-react"
import { useSound } from "@/hooks/useSound"
import AddGoalsModal from "@/components/dashboard/AddGoalsModal"

// Note: icons supply the visual accent; no additional color palette needed here

export function StrategyCircles({ checkpoints, positions, intro }: { checkpoints: TimelineCheckpoint[]; positions?: number[]; intro?: ReactNode }) {
  const items = useMemo(() => {
    const uniqueByYear = new Map<number, TimelineCheckpoint>()
    for (const c of checkpoints) {
      if (!uniqueByYear.has(c.year)) uniqueByYear.set(c.year, c)
    }
    return Array.from(uniqueByYear.values()).sort((a, b) => a.year - b.year)
  }, [checkpoints])

  // Allow multiple strategy details to remain open simultaneously
  const [openSet, setOpenSet] = useState<Set<number>>(new Set())
  const { play } = useSound()

  // Modal state for adding goals
  const [modalOpen, setModalOpen] = useState(false)
  const [modalYear, setModalYear] = useState<number | undefined>(undefined)
  const [modalGoals, setModalGoals] = useState<string[] | undefined>(undefined)

  // measure container width to compute responsive offsets
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [containerWidth, setContainerWidth] = useState<number>(0)

  useEffect(() => {
    const update = () => {
      const w = containerRef.current?.clientWidth || 0
      setContainerWidth(w)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  if (!items.length) {
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
                setOpenSet((prev) => {
                  const next = new Set(prev)
                  if (next.has(i)) next.delete(i)
                  else next.add(i)
                  return next
                })
              }}
              whileHover={{ scale: 1.15, transition: { duration: 0.12, ease: [0.2, 0.8, 0.2, 1] } }}
              whileTap={{ scale: 0.96 }}
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
                            <ul className="mt-3 text-left inline-block space-y-2">
                              {cp.items.map((item, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <Check className="h-5 w-5 text-accent mt-0.5 shrink-0" aria-hidden="true" />
                                  <span className="text-base leading-relaxed text-foreground/90">{item}</span>
                                </li>
                              ))}
                            </ul>
                          ) : null}
                          <div className="mt-4">
                            <Button
                              variant="jonquil"
                              className="rounded-full px-5 font-bold text-black text-base"
                              onClick={() => {
                                play('plop', 0.45)
                                // Prepopulate with up to 2 items for this year
                                const initial = Array.isArray(cp.items) && cp.items.length > 0
                                  ? cp.items.slice(0, 2)
                                  : (cp.title ? [cp.title] : [""])
                                setModalGoals(initial)
                                setModalYear(cp.year)
                                setModalOpen(true)
                              }}
                              aria-label={`Add ${cp.year} items to goals`}
                            >
                              Add to Goals
                            </Button>
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
