"use client"

import React, { useEffect, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { parseReportContent, type ParsedReport } from "@/lib/reportParser"

export default function StrategyStructuredReport() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<ParsedReport | null>(null)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch("/api/get-report")
        if (!res.ok) {
          if (res.status === 404) {
            if (mounted) setData(null)
            return
          }
          throw new Error("Failed to fetch report")
        }
        const json = await res.json()
        const parsed = parseReportContent(String(json.reportContent || ""))
        if (mounted) setData(parsed)
      } catch (e) {
        if (mounted) setError("Could not load your strategy details")
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  if (loading) {
    return (
      <div className="py-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto" />
        <p className="mt-2 text-sm text-muted-foreground">Loading your strategy…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-6 text-center">
        <p className="text-sm text-destructive mb-3">{error}</p>
        <Button variant="outline" onClick={() => location.assign("/quiz-selection")}>Take Quiz</Button>
      </div>
    )
  }

  if (!data) {
    return null
  }

  return (
    <div className="mx-auto max-w-[48rem]">
      {/* CURRENT STRENGTHS & TALENTS */}
      <section className="mt-12">
        <h2 className="text-2xl md:text-3xl font-bold font-space-grotesk tracking-wide text-foreground uppercase text-center mb-6">
          Current Strengths & Talents
        </h2>
        <div className="space-y-6">
          {data.strengths.length === 0 ? (
            <p className="text-muted-foreground text-center">No strengths extracted from your report.</p>
          ) : (
            data.strengths.map((s, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <Image src="/icons/goals.png" alt="Strength" width={22} height={22} className="shrink-0" />
                  <div className="text-lg font-semibold text-center">{s.title}</div>
                </div>
                {s.description && (
                  <p className="text-foreground/90 leading-relaxed" style={{ textAlign: 'justify' }}>{s.description}</p>
                )}
              </div>
            ))
          )}
        </div>
      </section>

      {/* MILESTONES & CHECKPOINTS */}
      <section className="mt-12">
        <h2 className="text-2xl md:text-3xl font-bold font-space-grotesk tracking-wide text-foreground uppercase text-center mb-6">
          Milestones & Checkpoints
        </h2>
        <div className="space-y-6">
          {data.milestones.length === 0 ? (
            <p className="text-muted-foreground text-center">No milestones extracted from your report.</p>
          ) : (
            data.milestones.map((m, idx) => (
              <div key={idx} className="space-y-2">
                {m.title && (
                  <div className="text-lg font-semibold text-center">{m.title}</div>
                )}
                {m.details.length > 0 && (
                  <ul className="list-disc list-inside space-y-2 text-foreground/90">
                    {m.details.map((d, i) => (
                      <li key={i} className="leading-relaxed">{d}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))
          )}
        </div>
      </section>

      {/* STRATEGIES FOR GROWTH */}
      <section className="mt-12">
        <h2 className="text-2xl md:text-3xl font-bold font-space-grotesk tracking-wide text-white uppercase text-center mb-6">
          Strategies for Growth & Overcoming Obstacles
        </h2>
        <div className="space-y-6">
          {data.strategies.length === 0 ? (
            <p className="text-muted-foreground text-center">No strategies extracted from your report.</p>
          ) : (
            data.strategies.map((s, idx) => (
              <div key={idx} className="space-y-2">
                {s.title && (
                  <div className="text-lg font-semibold text-center">{s.title}</div>
                )}
                {s.details.length > 0 && (
                  <ul className="list-disc list-inside space-y-2 text-foreground/90">
                    {s.details.map((d, i) => (
                      <li key={i} className="leading-relaxed">{d}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))
          )}
        </div>
      </section>

      {/* OUTRO */}
      {data.outro && (
        <p className="mt-12 text-foreground/90 leading-relaxed" style={{ textAlign: 'justify' }}>
          {data.outro}
        </p>
      )}
    </div>
  )
}
