"use client"
import * as React from 'react'
import { TimelineCheckpoint } from '@/types/timeline'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { GlowCard } from '@/components/ui/GlowCard'
import { motion } from 'framer-motion'

function computeProgressFromTimeline(checkpoints: TimelineCheckpoint[]): { progress: number; level: number; label: string } {
  if (!checkpoints || checkpoints.length === 0) return { progress: 0, level: 1, label: 'Hero 1' }
  const years = checkpoints.map(c => c.year).filter(y => Number.isFinite(y))
  const minY = Math.min(...years)
  const maxY = Math.max(...years)
  const now = new Date().getFullYear()
  const denom = Math.max(1, maxY - minY)
  const pct = Math.max(0, Math.min(1, (now - minY) / denom))
  const progress = Math.round(pct * 100)
  const level = 1 + Math.min(9, Math.floor((progress) / 20)) // levels 1-10
  return { progress, level, label: `Hero ${level}` }
}

export function XPWidget({ checkpoints }: { checkpoints: TimelineCheckpoint[] }) {
  const { progress, label } = computeProgressFromTimeline(checkpoints)
  return (
    <GlowCard className="p-4">
      <div className="flex items-center gap-4">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 120, damping: 12 }}>
          <ProgressRing progress={progress} />
        </motion.div>
        <div className="space-y-1">
          <div className="text-sm text-muted-foreground">Your XP</div>
          <div className="text-2xl font-bold">{label}</div>
          <div className="text-xs text-muted-foreground">{progress}% toward Future U</div>
        </div>
      </div>
    </GlowCard>
  )
}

export default XPWidget
