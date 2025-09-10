"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import type { TimelineCheckpoint } from "@/types/timeline"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import Image from "next/image"

// Note: icons supply the visual accent; no additional color palette needed here

export function StrategyCircles({ checkpoints, positions }: { checkpoints: TimelineCheckpoint[]; positions?: number[] }) {
  const items = useMemo(() => {
    const uniqueByYear = new Map<number, TimelineCheckpoint>()
    for (const c of checkpoints) {
      if (!uniqueByYear.has(c.year)) uniqueByYear.set(c.year, c)
    }
    return Array.from(uniqueByYear.values()).sort((a, b) => a.year - b.year)
  }, [checkpoints])

  // Allow multiple strategy details to remain open simultaneously
  const [openSet, setOpenSet] = useState<Set<number>>(new Set())

  if (!items.length) {
    return (
      <div className="p-8 text-center space-y-3">
        <p className="text-muted-foreground">No strategy yet. Take a quiz to generate your Career Strategy.</p>
        <Button asChild className="rounded-full">
          <Link href="/quiz-selection">Take Quiz to Get Started</Link>
        </Button>
      </div>
    )
  }

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

  // default offset curve if positions are not provided (normalized -1..1)
  const defaultNormalized = (index: number) => Math.sin(index * 1.1)

  return (
    <div ref={containerRef} className="relative max-w-3xl mx-auto py-10">

      {/* Title, middle aligned, space grotesk font */}
      <h1 className="text-3xl font-bold mb-10 text-center">Your Strategy</h1>
      <ul className="relative space-y-24">
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
              onClick={() =>
                setOpenSet((prev) => {
                  const next = new Set(prev)
                  if (next.has(i)) next.delete(i)
                  else next.add(i)
                  return next
                })
              }
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.96 }}
              className={cn(
                "relative z-10 grid place-items-center transition-transform focus:outline-none",
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
                          <p className="text-base leading-relaxed text-foreground/90" style={{ textAlign: 'justify' }}>
                            {cp.description}
                          </p>
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
    </div>
  )
}
