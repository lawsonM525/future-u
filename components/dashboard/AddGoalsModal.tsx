"use client"
import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useSound } from '@/hooks/useSound'

export interface AddGoalsModalProps {
  open: boolean
  defaultYear?: number
  initialGoals?: string[]
  onClose: () => void
  onSaved?: () => void
}

export default function AddGoalsModal({ open, defaultYear, initialGoals, onClose, onSaved }: AddGoalsModalProps) {
  const { play } = useSound()
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [skippedCount, setSkippedCount] = React.useState<number>(0)
  const [rows, setRows] = React.useState<Array<{ title: string; year: string }>>([])

  React.useEffect(() => {
    if (open) {
      const yearStr = typeof defaultYear === 'number' ? String(defaultYear) : ''
      const seed = (initialGoals && initialGoals.length > 0 ? initialGoals.slice(0, 2) : []).map(g => ({ title: g, year: yearStr }))
      const base = seed.length > 0 ? seed : [{ title: '', year: yearStr }, { title: '', year: yearStr }]
      setRows(base)
      setError(null)
    }
  }, [open, defaultYear, initialGoals])

  if (!open) return null

  async function handleSave() {
    try {
      setSaving(true)
      setError(null)
      setSkippedCount(0)

      // Normalize helpers
      const normTitle = (s: string) => s.toLowerCase().replace(/\s+/g, ' ').trim()
      const makeKey = (t: string, y?: number | null) => `${normTitle(t)}|${Number.isFinite(y as number) ? String(y) : 'any'}`

      // Fetch existing goals to prevent duplicates
      let existingKeys = new Set<string>()
      try {
        const existingRes = await fetch('/api/goals', { cache: 'no-store' })
        if (existingRes.ok) {
          const existingData = await existingRes.json()
          const goals: Array<{ title: string; checkpointYear?: number | null }> = Array.isArray(existingData?.goals) ? existingData.goals : []
          for (const g of goals) {
            existingKeys.add(makeKey(String(g.title || ''), typeof g.checkpointYear === 'number' ? g.checkpointYear : undefined))
          }
        }
      } catch {
        // If fetching existing goals fails, we still proceed with local de-dupe
      }

      // Build payloads, dedupe locally and skip those already present
      const raw = rows
        .map(r => ({ title: r.title.trim(), year: r.year.trim() }))
        .filter(r => r.title.length > 0)
        .map(r => ({ title: r.title, checkpointYear: r.year ? Number(r.year) : undefined }))

      const seenNew = new Set<string>()
      const filtered: Array<{ title: string; checkpointYear?: number }> = []
      for (const p of raw) {
        const key = makeKey(p.title, p.checkpointYear)
        if (seenNew.has(key)) continue
        seenNew.add(key)
        if (!existingKeys.has(key)) {
          filtered.push(p)
        }
      }

      const skipped = raw.length - filtered.length
      if (skipped > 0) setSkippedCount(skipped)

      const payloads = filtered

      if (payloads.length === 0) {
        setError('These goals already exist or are empty. Please edit or add new ones.')
        setSaving(false)
        return
      }

      // Save all goals
      const res = await Promise.all(
        payloads.map(p => fetch('/api/goals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(p)
        }))
      )
      const anyFailed = res.some(r => !r.ok)
      if (anyFailed) {
        setError('Some goals could not be saved. Please try again.')
        setSaving(false)
        return
      }

      play('levelup', 0.6)
      onClose()
      onSaved?.()
    } catch (e) {
      setError('Failed to save goals. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-goals-title"
        className="relative z-10 w-full max-w-xl rounded-xl bg-zinc-900/95 border border-white/10 shadow-2xl p-6 md:p-7"
      >
        <div className="space-y-5">
          <div className="flex items-start justify-between">
            <h2 id="add-goals-title" className="text-lg font-semibold">Add to Goals</h2>
            <button onClick={onClose} aria-label="Close" className="text-sm text-muted-foreground hover:text-foreground">✕</button>
          </div>
          <div className="text-sm text-muted-foreground">Review and edit your goals. You can also add another one.</div>

          <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
            {rows.map((row, idx) => (
              <div key={idx} className="grid grid-cols-[1fr,120px] items-start gap-3">
                <Textarea
                  placeholder={`Goal ${idx + 1}`}
                  value={row.title}
                  rows={2}
                  onChange={(e) => {
                    const next = [...rows]
                    next[idx] = { ...next[idx], title: e.target.value }
                    setRows(next)
                  }}
                  className="w-full"
                />
                <Input
                  placeholder="Year"
                  inputMode="numeric"
                  value={row.year}
                  onChange={(e) => {
                    const next = [...rows]
                    next[idx] = { ...next[idx], year: e.target.value }
                    setRows(next)
                  }}
                  className="w-[120px]"
                />
              </div>
            ))}
            <div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRows(prev => [...prev, { title: '', year: typeof defaultYear === 'number' ? String(defaultYear) : '' }])}
              >
                + Add another
              </Button>
            </div>
          </div>

          {error && <div className="text-sm text-destructive">{error}</div>}
          {!error && skippedCount > 0 && (
            <div className="text-xs text-muted-foreground">Skipped {skippedCount} duplicate goal{skippedCount === 1 ? '' : 's'}.</div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
            <Button
              variant="jonquil"
              className="font-bold text-white"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving…' : 'Save to Goals'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
