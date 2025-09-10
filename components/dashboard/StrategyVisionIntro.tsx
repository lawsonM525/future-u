"use client"

import React, { useEffect, useState } from "react"
import { parseReportContent, type ParsedReport } from "@/lib/reportParser"

export default function StrategyVisionIntro() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [intro, setIntro] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch("/api/get-report")
        if (!res.ok) {
          setIntro(null)
          return
        }
        const data = await res.json()
        const parsed: ParsedReport = parseReportContent(String(data.reportContent || ""))
        const firstPara = parsed.visionParagraphs[0] || null
        if (mounted) setIntro(firstPara)
      } catch (e) {
        if (mounted) setError("Failed to load report intro")
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  if (loading) return null
  if (error) return null
  if (!intro) return null

  return (
    <>
      <p className="text-base leading-relaxed text-foreground/90" style={{ textAlign: 'justify' }}>{intro}</p>
      <p className="text-base leading-relaxed text-foreground/90" style={{ textAlign: 'justify' }}>
        Here's how you are going to achieve this life.
      </p>
    </>
  )
}
