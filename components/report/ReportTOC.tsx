"use client"
import * as React from 'react'
import { cn } from '@/lib/utils'

export type HeadingItem = { id: string; text: string; level: 2 | 3 }

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export function buildHeadings(markdown: string): HeadingItem[] {
  const lines = markdown.split(/\r?\n/)
  const items: HeadingItem[] = []
  const seen = new Map<string, number>()
  for (const line of lines) {
    const m2 = line.match(/^##\s+(.+)/)
    const m3 = line.match(/^###\s+(.+)/)
    if (m2 || m3) {
      const text = (m2?.[1] || m3?.[1] || '').trim()
      let slug = slugify(text)
      const count = seen.get(slug) || 0
      if (count > 0) slug = `${slug}-${count + 1}`
      seen.set(slug, count + 1)
      items.push({ id: slug, text, level: m2 ? 2 : 3 })
    }
  }
  return items
}

export function ReportTOC({
  headings,
  activeId,
  onNavigate,
}: {
  headings: HeadingItem[]
  activeId?: string
  onNavigate?: (id: string) => void
}) {
  return (
    <nav className="text-sm sticky top-24 max-h-[70vh] overflow-auto pr-2">
      <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">On this page</div>
      <ul className="space-y-1">
        {headings.map((h) => (
          <li key={h.id}>
            <button
              onClick={() => onNavigate?.(h.id)}
              className={cn(
                'text-left w-full truncate hover:text-accent transition-colors',
                h.level === 3 ? 'pl-3 text-[13px]' : 'pl-0 font-medium',
                activeId === h.id ? 'text-accent' : 'text-muted-foreground'
              )}
            >
              {h.text}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}
