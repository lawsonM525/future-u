"use client"

import React, { useEffect, useState } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Button } from "@/components/ui/button"

export function StrategyReportInline() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [content, setContent] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    const fetchReport = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch("/api/get-report")
        if (!res.ok) {
          if (res.status === 404) {
            setContent(null)
            return
          }
          throw new Error("Failed to fetch report")
        }
        const data = await res.json()
        if (mounted) {
          setContent(data.reportContent || null)
        }
      } catch {
        if (mounted) setError("Could not load your report")
      } finally {
        if (mounted) setLoading(false)
      }
    }
    fetchReport()
    return () => { mounted = false }
  }, [])

  if (loading) {
    return (
      <div className="py-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto" />
        <p className="mt-2 text-sm text-muted-foreground">Loading your report…</p>
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

  if (!content) {
    return (
      <div className="py-6 text-center">
        <p className="text-muted-foreground">No report found. Take a quiz to generate your Career Strategy.</p>
        <Button className="mt-3 rounded-full" onClick={() => location.assign("/quiz-selection")}>Take Quiz</Button>
      </div>
    )
  }

  return (
    <section className="mt-10">
      <h2 className="text-2xl font-bold mb-6 text-center font-space-grotesk">YOUR REPORT</h2>
      <div className="mx-auto max-w-[42rem] text-center break-words">
        <div className="prose prose-invert max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              p: ({ children, ...props }) => (
                <p className="text-base leading-relaxed text-foreground/90" style={{ textAlign: 'justify' }} {...props}>
                  {children}
                </p>
              ),
              strong: ({ ...props }) => <strong className="text-accent font-semibold" {...props} />,
              ul: ({ ...props }) => <ul className="list-disc list-inside space-y-2 text-left" {...props} />,
              li: ({ children, ...props }) => (
                <li className="text-foreground/90" {...props}>{children}</li>
              ),
              h2: ({ children, ...props }) => (
                <h3 className="text-xl font-semibold mt-6 mb-2 text-accent" {...props}>{children}</h3>
              ),
              h3: ({ children, ...props }) => (
                <h4 className="text-lg font-medium mt-4 mb-2 text-accent/90" {...props}>{children}</h4>
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      </div>
    </section>
  )
}
