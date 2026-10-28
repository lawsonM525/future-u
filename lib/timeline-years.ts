import type { TimelineCheckpoint } from '../types/timeline'

export function getTimelineYears(now = new Date()): number[] {
  const year = now.getUTCFullYear()
  return Array.from({ length: 6 }, (_, index) => year + index)
}

// Repair the old hard-coded template only when it was generated after 2025.
// Genuine historical plans and completed goals keep their original dates.
export function alignLegacyTimeline(checkpoints: TimelineCheckpoint[], createdAt: Date): TimelineCheckpoint[] {
  const year = new Date(createdAt).getUTCFullYear()
  if (year <= 2025 || !Number.isFinite(year) || checkpoints.length !== 6 || !checkpoints.every((checkpoint, index) => checkpoint.year === 2025 + index)) return checkpoints
  return checkpoints.map((checkpoint, index) => ({
    year: year + index, title: checkpoint.title, description: checkpoint.description, items: checkpoint.items,
  }))
}
