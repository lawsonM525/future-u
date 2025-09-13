"use client"

import React from 'react'
import { GlowCard } from '@/components/ui/GlowCard'
import { useStrategyResources } from '@/hooks/useStrategyResources'

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
      {groups.map((g, gi) => (
        <GlowCard key={gi} className="p-6">
          <h3 className="text-xl font-semibold text-center mb-4">{g.title}</h3>
          <div className="space-y-5">
            {g.details.map((d, di) => (
              <div key={di}>
                <div className="text-base font-medium mb-2">{d.text}</div>
                {d.results.length === 0 ? (
                  <div className="text-sm text-muted-foreground">No links found for this item.</div>
                ) : (
                  <ul className="space-y-2">
                    {d.results.map((r, ri) => (
                      <li key={ri} className="text-sm">
                        <a
                          href={r.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline decoration-dotted hover:text-foreground"
                        >
                          {r.title || r.url}
                        </a>
                        {r.author ? <span className="ml-2 opacity-80">by {r.author}</span> : null}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </GlowCard>
      ))}
    </div>
  )
}
