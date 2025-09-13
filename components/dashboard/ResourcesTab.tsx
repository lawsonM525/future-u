"use client"

import React from 'react'
import { GlowCard } from '@/components/ui/GlowCard'
import { useStrategyResources } from '@/hooks/useStrategyResources'
import { Brain, Camera, Mic, Users, BookOpen, Video, Code2, Sparkles, ExternalLink, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

// Accent palettes for sections
const accents = [
  {
    name: 'teal',
    text: 'text-fluorescent-cyan',
    bg: 'bg-fluorescent-cyan/10',
    ring: 'ring-fluorescent-cyan/30',
    underline: 'decoration-fluorescent-cyan/60',
    hover: 'hover:text-fluorescent-cyan'
  },
  {
    name: 'purple',
    text: 'text-plum-web',
    bg: 'bg-plum-web/10',
    ring: 'ring-plum-web/30',
    underline: 'decoration-plum-web/60',
    hover: 'hover:text-plum-web'
  },
  {
    name: 'lime',
    text: 'text-lime',
    bg: 'bg-lime/10',
    ring: 'ring-lime/30',
    underline: 'decoration-lime/60',
    hover: 'hover:text-lime'
  },
  {
    name: 'gold',
    text: 'text-jonquil',
    bg: 'bg-jonquil/10',
    ring: 'ring-jonquil/30',
    underline: 'decoration-jonquil/60',
    hover: 'hover:text-jonquil'
  }
]

function accentFor(index: number, title?: string) {
  const t = (title || '').toLowerCase()
  if (t.includes('technical') || t.includes('engineer') || t.includes('skill') || t.includes('code')) {
    return accents[0] // teal
  }
  if (t.includes('diversify') || t.includes('content') || t.includes('format') || t.includes('writing')) {
    return accents[1] // purple
  }
  return accents[index % accents.length]
}

function getGroupIcon(title: string) {
  const t = title.toLowerCase()
  if (t.includes('technical') || t.includes('engineer') || t.includes('skill') || t.includes('code')) return Brain
  if (t.includes('video')) return Camera
  if (t.includes('podcast') || t.includes('audio')) return Mic
  if (t.includes('network')) return Users
  if (t.includes('content') || t.includes('writing') || t.includes('blog')) return BookOpen
  return Sparkles
}

function getItemIcon(text: string) {
  const t = text.toLowerCase()
  if (t.includes('video') || t.includes('youtube')) return Video
  if (t.includes('podcast') || t.includes('audio')) return Mic
  if (t.includes('network') || t.includes('collab') || t.includes('partnership')) return Users
  if (t.includes('code') || t.includes('technical') || t.includes('skill')) return Code2
  if (t.includes('write') || t.includes('blog') || t.includes('book')) return BookOpen
  return Sparkles
}

function getResultIcon(title?: string, url?: string, snippet?: string) {
  const source = `${title || ''} ${url || ''} ${snippet || ''}`.toLowerCase()
  if (source.includes('youtube') || source.includes('vimeo') || source.includes('video')) return Video
  if (source.includes('podcast') || source.includes('spotify') || source.includes('apple podcasts')) return Mic
  if (source.includes('meetup') || source.includes('linkedin') || source.includes('eventbrite') || source.includes('network')) return Users
  if (source.includes('github') || source.includes('dev.to') || source.includes('stack overflow') || source.includes('code')) return Code2
  if (source.includes('blog') || source.includes('article') || source.includes('book') || source.includes('guide') || source.includes('medium') || source.includes('substack')) return BookOpen
  return Sparkles
}

export default function ResourcesTab() {
  const { loading, error, groups } = useStrategyResources(3)

  if (loading) {
    return (
      <GlowCard className="p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto" />
        <p className="mt-2 text-sm text-muted-foreground">Finding resources for your strategy…</p>
      </GlowCard>
    )
  }

  if (error) {
    return (
      <GlowCard className="p-6 text-center">
        <p className="text-sm text-destructive">{error}</p>
      </GlowCard>
    )
  }

  if (!groups.length) {
    return (
      <GlowCard className="p-6 text-center">
        <p className="text-sm text-muted-foreground">No resources yet. Generate your strategy first.</p>
      </GlowCard>
    )
  }

  return (
    <div className="space-y-6">
      {groups.map((g, gi) => {
        const accent = accentFor(gi, g.title)
        const GroupIcon = getGroupIcon(g.title)
        return (
          <GlowCard
            key={gi}
            className={cn(
              'p-0 overflow-hidden rounded-3xl transition-shadow shadow-[0_10px_30px_rgba(0,0,0,0.25)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.35)] border-0'
            )}
            glow={false}
          >
            <details open className="group">
              <summary className="flex items-center gap-3 p-6 md:p-8 cursor-pointer list-none select-none">
                <div className={cn('shrink-0 rounded-xl p-2 ring-1', accent.bg, accent.ring)}>
                  <GroupIcon className={cn('h-5 w-5', accent.text)} />
                </div>
                <h3 className="text-xl md:text-2xl font-semibold tracking-tight flex-1">
                  {g.title}
                </h3>
                <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform group-open:rotate-180" />
              </summary>

              <div className="px-6 pb-6 md:px-8 md:pb-8">
                <div className="space-y-6">
                  {g.details.map((d, di) => {
                    const ItemIcon = getItemIcon(d.text)
                    return (
                      <div
                        key={di}
                        className="md:grid md:grid-cols-5 md:gap-8 border-t border-border/60 pt-5 first:pt-0 first:border-t-0"
                      >
                        {/* Left: description */}
                        <div className="md:col-span-2 flex items-start gap-3 max-w-prose">
                          <ItemIcon className={cn('h-4 w-4 mt-1.5', accent.text)} />
                          <div className="text-sm md:text-base leading-relaxed text-foreground/90 break-words">
                            {d.text}
                          </div>
                        </div>

                        {/* Right: links/resources */}
                        <div className="md:col-span-3 mt-3 md:mt-0">
                          {d.results.length === 0 ? (
                            <div className="text-sm text-muted-foreground">No links found for this item.</div>
                          ) : (
                            <ul className="space-y-2 md:space-y-3">
                              {d.results.map((r, ri) => {
                                const ResultIcon = getResultIcon(r.title, r.url, r.snippet)
                                return (
                                  <li key={ri} className="text-sm leading-relaxed flex items-start gap-2 w-full">
                                    <ResultIcon className={cn('h-3.5 w-3.5 mt-1', accent.text)} aria-hidden="true" />
                                    <div>
                                      <a
                                        href={r.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={cn(
                                          'inline-flex flex-wrap items-center gap-1.5 font-medium underline underline-offset-4 transition-colors whitespace-normal break-words max-w-full',
                                          accent.text,
                                          accent.underline,
                                          accent.hover
                                        )}
                                      >
                                        {r.title || r.url}
                                        <ExternalLink className="h-3.5 w-3.5 opacity-80" aria-hidden="true" />
                                      </a>
                                      {r.author ? (
                                        <span className="ml-2 text-xs text-muted-foreground">by {r.author}</span>
                                      ) : null}
                                      {r.snippet ? (
                                        <div className="mt-1 text-xs text-muted-foreground/80">{r.snippet}</div>
                                      ) : null}
                                    </div>
                                  </li>
                                )
                              })}
                            </ul>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </details>
          </GlowCard>
        )
      })}
    </div>
  )
}

