'use client'

import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { ReportTOC, buildHeadings, type HeadingItem } from '@/components/report/ReportTOC'
import { ShareSheet } from '@/components/share/ShareSheet'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Share2, ChevronDown } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

// Types and helpers
type SectionItem = { id: string; title: string; level: 2 | 3; body: string }

function slugify(text: string) {
  return text.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-')
}

function isElementLike(value: unknown): value is { props?: { children?: ReactNode } } {
  return typeof value === 'object' && value !== null && 'props' in (value as Record<string, unknown>)
}

function flattenText(nodes: ReactNode): string {
  if (nodes === null || nodes === undefined) return ''
  if (typeof nodes === 'string') return nodes
  if (typeof nodes === 'number') return String(nodes)
  if (Array.isArray(nodes)) return (nodes as ReactNode[]).map(flattenText).join('')
  if (isElementLike(nodes)) return flattenText(nodes.props?.children as ReactNode)
  return ''
}

function parseMarkdownSections(md: string): SectionItem[] {
  const lines = md.split(/\r?\n/)
  const out: SectionItem[] = []
  let current: SectionItem | null = null
  const seen = new Map<string, number>()
  const pushCurrent = () => { if (current) out.push(current); current = null }
  for (const line of lines) {
    const m2 = line.match(/^##\s+(.+)/)
    const m3 = line.match(/^###\s+(.+)/)
    if (m2 || m3) {
      pushCurrent()
      const title = (m2?.[1] || m3?.[1] || '').trim()
      let id = slugify(title)
      const count = seen.get(id) || 0
      if (count > 0) id = `${id}-${count + 1}`
      seen.set(id, count + 1)
      current = { id, title, level: m2 ? 2 : 3, body: '' }
    } else {
      if (!current) {
        // If content before first heading, create an intro section
        current = { id: 'introduction', title: 'Introduction', level: 2, body: '' }
      }
      current.body += (current.body ? '\n' : '') + line
    }
  }
  pushCurrent()
  return out
}

export default function ReportPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [report, setReport] = useState<{ content: string; createdAt: string } | null>(null)
  const [sections, setSections] = useState<SectionItem[]>([])
  const [toc, setToc] = useState<HeadingItem[]>([])
  const [open, setOpen] = useState<Record<string, boolean>>({})
  const [activeId, setActiveId] = useState<string | undefined>()
  const [shareOpen, setShareOpen] = useState(false)
  const [shareText, setShareText] = useState('')
  const contentRef = useRef<HTMLDivElement | null>(null)
  const [progress, setProgress] = useState(0)
  const { toast } = useToast()

  useEffect(() => {
    const sendPendingReport = async () => {
      // Check if we've already sent this report
      const sentReports = JSON.parse(localStorage.getItem('sentReports') || '[]')
      
      if (sentReports.includes('pendingReport')) {
        // Already sent this report, just clean up storage
        sessionStorage.removeItem('pendingReportContent')
        return
      }

      const pendingReportContent = sessionStorage.getItem('pendingReportContent')
      if (pendingReportContent && session?.user?.email && session?.user?.name) {
        try {
          const response = await fetch('/api/send-report', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ reportId: 'pendingReport' }),
          })

          if (!response.ok) {
            console.error('Failed to send report email')
          } else {
            // Mark this report as sent
            sentReports.push('pendingReport')
            localStorage.setItem('sentReports', JSON.stringify(sentReports))
          }
        } catch (error) {
          console.error('Error sending report:', error)
        } finally {
          // Clear the pending report even if sending failed
          sessionStorage.removeItem('pendingReportContent')
        }
      }
    }

    if (status === 'authenticated') {
      sendPendingReport()
    }
  }, [status, session])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (status === 'authenticated' && session?.user?.email) {
      const fetchReport = async () => {
        try {
          setLoading(true)
          setError(null)
          
          const res = await fetch('/api/get-report')
          if (!res.ok) {
            if (res.status === 404) {
              // No report found, redirect to quiz selection
              router.push('/quiz-selection')
              return
            }
            throw new Error('Failed to fetch report')
          }
          
          const data = await res.json()
          if (data.reportContent) {
            setReport({
              content: data.reportContent,
              createdAt: data.createdAt
            })
            // Build TOC and sections
            const headings = buildHeadings(data.reportContent as string)
            setToc(headings)
            const s = parseMarkdownSections(data.reportContent as string)
            setSections(s)
            // Collapse by default
            const initial: Record<string, boolean> = {}
            s.forEach((sec, idx) => { initial[sec.id] = idx === 0 ? true : false })
            setOpen(initial)
          } else {
            // No report content, redirect to quiz selection
            router.push('/quiz-selection')
          }
        } catch (err) {
          setError('Error loading report')
          console.error(err)
        } finally {
          setLoading(false)
        }
      }

      fetchReport()
    }
  }, [status, session, router])

  // Observe section headings for active TOC state
  useEffect(() => {
    const container = contentRef.current
    if (!container) return
    const ids = sections.map(s => s.id)
    const observers: IntersectionObserver[] = []
    ids.forEach(id => {
      const el = document.getElementById(id)
      if (!el) return
      const obs = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(id)
        })
      }, { root: null, rootMargin: '-25% 0px -65% 0px', threshold: 0 })
      obs.observe(el)
      observers.push(obs)
    })
    return () => observers.forEach(o => o.disconnect())
  }, [sections])

  // Scroll progress within content
  useEffect(() => {
    const onScroll = () => {
      const el = contentRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const total = el.scrollHeight - rect.height
      const scrolled = Math.min(Math.max(el.scrollTop, 0), total)
      const pct = total > 0 ? scrolled / total : 0
      setProgress(pct)
    }
    const el = contentRef.current
    if (!el) return
    el.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => el.removeEventListener('scroll', onScroll)
  }, [contentRef, sections.length])

  function onNavigate(id: string) {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  async function addGoalInline(title: string) {
    const t = title.trim()
    if (!t) return
    const res = await fetch('/api/goals', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: t }) })
    if (res.ok) {
      toast({ title: 'Added to Goals', description: 'You can track it in your dashboard.' })
    } else {
      toast({ title: 'Could not add goal', description: 'Please try again later.' })
    }
  }

  function openShare(text: string) {
    setShareText(text)
    setShareOpen(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
        <h2 className="text-2xl font-bold text-center">
          Loading Your Career Strategy
        </h2>
        <p className="text-center text-muted-foreground max-w-md">
          Just a moment while we prepare your personalized career insights and recommendations...
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background text-foreground p-8">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h1 className="text-2xl font-bold text-accent">{error}</h1>
          <Button asChild variant="outline">
            <Link href="/quiz-selection">Take the Quiz</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-6 sm:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-accent">Your Career Strategy</h1>
            {session?.user && (
              <p className="text-xs sm:text-sm text-muted-foreground">Prepared for {session.user.name}{report?.createdAt && ` · ${new Date(report.createdAt).toLocaleDateString()}`}</p>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push('/dashboard')}>Dashboard</Button>
            <Button variant="outline" onClick={() => router.push('/quiz-selection')}>Retake Quiz</Button>
            <Button
              variant="outline"
              onClick={() => openShare('Exploring my Career Strategy on Future U!')}
            >
              Share
            </Button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-[260px,1fr] gap-6">
          {/* Sticky TOC */}
          <aside className="hidden md:block">
            <ReportTOC headings={toc} activeId={activeId} onNavigate={onNavigate} />
          </aside>

          <Card className="border-border bg-card">
            <CardHeader className="space-y-2">
              <CardTitle className="text-xl font-semibold text-accent">Browse your insights</CardTitle>
              <CardDescription className="text-muted-foreground">Tap a section to expand. Add action items directly to your goals and share your favorite highlights.</CardDescription>
            </CardHeader>
            <CardContent>
              {report?.content ? (
                <div className="relative">
                  {/* Scroll progress bar */}
                  <div className="sticky top-0 z-10 h-1 w-full bg-secondary rounded overflow-hidden">
                    <div className="h-1 bg-accent transition-[width]" style={{ width: `${Math.round(progress * 100)}%` }} />
                  </div>

                  <div ref={contentRef} className="max-h-[70vh] overflow-y-auto pr-1">
                    <div className="space-y-4">
                      {sections.map((sec) => (
                        <section key={sec.id} id={sec.id} className="border border-border rounded-lg bg-secondary">
                          <button
                            className="w-full text-left px-4 py-3 flex items-center justify-between hover:bg-secondary/50 rounded-t-lg"
                            onClick={() => setOpen((prev) => ({ ...prev, [sec.id]: !prev[sec.id] }))}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-accent font-medium">{sec.title}</span>
                            </div>
                            <motion.div
                              animate={{ rotate: open[sec.id] ? 180 : 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <ChevronDown className="w-5 h-5 text-muted-foreground" />
                            </motion.div>
                          </button>
                          <AnimatePresence initial={false}>
                            {open[sec.id] && (
                              <motion.div
                                key="content"
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                className="px-4 pb-4"
                              >
                                <div className="prose prose-invert max-w-none">
                                  <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    components={{
                                      p: ({ children, ...props }) => (
                                        <div className="group relative">
                                          <p className="text-muted-foreground leading-relaxed" {...props}>{children}</p>
                                          <button
                                            onClick={() => openShare(flattenText(children as ReactNode))}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-1 right-0 text-xs text-accent flex items-center gap-1"
                                            title="Share as card"
                                          >
                                            <Share2 className="w-3 h-3" /> Share
                                          </button>
                                        </div>
                                      ),
                                      strong: ({...props}) => <strong className="text-accent font-semibold" {...props} />,
                                      ul: ({...props}) => <ul className="list-disc list-inside space-y-2" {...props} />,
                                      li: ({ children, ...props }) => (
                                        <li className="text-muted-foreground flex items-start gap-2" {...props}>
                                          <span className="flex-1">{children}</span>
                                          <button
                                            className="shrink-0 text-accent hover:text-accent/80"
                                            title="Add to Goals"
                                            onClick={() => addGoalInline(flattenText(children as ReactNode))}
                                          >
                                            <Plus className="w-4 h-4" />
                                          </button>
                                        </li>
                                      ),
                                      blockquote: ({ children, ...props }) => {
                                        const content = flattenText(children as ReactNode).trim()
                                        const type = content.startsWith('[!TIP]') ? 'tip' : content.startsWith('[!WARNING]') ? 'warning' : content.startsWith('[!INFO]') ? 'info' : null
                                        const cleaned = type ? content.replace(/^\[!\w+\]\s*/, '') : content
                                        const styles = type === 'tip' ? 'border-lime/60 bg-lime/5 text-lime'
                                          : type === 'warning' ? 'border-canary/60 bg-canary/5 text-canary'
                                          : type === 'info' ? 'border-fluorescent-cyan/60 bg-fluorescent-cyan/5 text-fluorescent-cyan'
                                          : 'border-border bg-card'
                                        return (
                                          <div className="group relative">
                                            <blockquote className={`text-sm not-italic border-l-4 pl-3 pr-8 py-2 rounded ${styles}`} {...props}>
                                              <p className="text-foreground/80">{type ? cleaned : children}</p>
                                                                                          </blockquote>
                                            <button
                                              onClick={() => openShare(type ? cleaned : content)}
                                              className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-1 right-1 text-xs text-accent flex items-center gap-1"
                                              title="Share as card"
                                            >
                                              <Share2 className="w-3 h-3" /> Share
                                            </button>
                                          </div>
                                        )
                                      },
                                    }}
                                  >
                                    {sec.body}
                                  </ReactMarkdown>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </section>
                      ))}
                    </div>
                  </div>

                  <ShareSheet open={shareOpen} onOpenChange={setShareOpen} text={shareText} ogUrl="/api/og/report-highlight" />
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No report content available. Please take a quiz to generate your report.</p>
                  <Button variant="outline" className="mt-4" onClick={() => router.push('/quiz-selection')}>Take Quiz</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
