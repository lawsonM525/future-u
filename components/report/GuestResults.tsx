'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StrategyCircles } from '@/components/dashboard/StrategyCircles'
import type { TimelineCheckpoint } from '@/types/timeline'

interface Results {
  status: 'pending' | 'processing' | 'ready' | 'failed'
  content: string
  summary: string
  checkpoints: TimelineCheckpoint[]
  canRetry: boolean
  stale: boolean
  timelineError: boolean
}

async function requestJson(url: string, init?: RequestInit, timeout = 15_000) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)
  try {
    const response = await fetch(url, { ...init, signal: controller.signal, cache: 'no-store' })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Something went wrong. Please try again.')
    return data
  } finally { clearTimeout(timer) }
}

export default function GuestResults({ token }: { token: string }) {
  const api = `/api/guest-reports/${token}`
  const router = useRouter()
  const { status } = useSession()
  const [report, setReport] = useState<Results | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [slow, setSlow] = useState(false)
  const [email, setEmail] = useState('')
  const [emailStatus, setEmailStatus] = useState('')
  const [emailBusy, setEmailBusy] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const saveStarted = useRef(false)

  const generate = useCallback(async (retryTimeline = false) => {
    setBusy(true)
    setReport(previous => previous ? { ...previous, status: 'processing' } : previous)
    setError('')
    setSlow(false)
    try {
      const data = await requestJson(api, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ retryTimeline }) }, 270_000)
      setReport(data)
    } catch (failure) {
      setError(failure instanceof Error && failure.name !== 'AbortError' ? failure.message : 'This is taking longer than expected. Your answers are safe. Keep this page open or return using this link.')
    } finally { setBusy(false) }
  }, [api])

  useEffect(() => {
    let active = true
    void requestJson(api).then((data: Results) => {
      if (!active) return
      setReport(data)
      if (data.status === 'pending') void generate()
    }).catch(failure => { if (active) setError(failure instanceof Error ? failure.message : 'Could not load your results.') })
    const slowTimer = setTimeout(() => { if (active) setSlow(true) }, 270_000)
    return () => { active = false; clearTimeout(slowTimer) }
  }, [api, generate])

  useEffect(() => {
    if (report?.status !== 'pending' && report?.status !== 'processing') return
    let active = true
    const interval = setInterval(() => {
      void requestJson(api).then((data: Results) => { if (active) setReport(data) })
        .catch(() => { /* The generation request reports errors; polling can recover from a temporary disconnect. */ })
    }, 2500)
    return () => { active = false; clearInterval(interval) }
  }, [api, report?.status])

  const saveReport = useCallback(async () => {
    setSaving(true)
    setSaveError('')
    try {
      if (status !== 'authenticated') {
        await signIn('google', { callbackUrl: `${window.location.origin}/results/${token}?save=1` })
        return
      }
      await requestJson(`${api}/save`, { method: 'POST' }, 30_000)
      router.replace('/dashboard')
    } catch (failure) {
      setSaveError(failure instanceof Error ? failure.message : 'Could not save your report.')
      setSaving(false)
      saveStarted.current = false
    }
  }, [api, router, status, token])

  useEffect(() => {
    if (status === 'authenticated' && report?.content && !saveStarted.current && new URLSearchParams(window.location.search).get('save') === '1') {
      saveStarted.current = true
      void saveReport()
    }
  }, [status, report?.content, saveReport])

  const sendEmail = async (event: React.FormEvent) => {
    event.preventDefault()
    setEmailBusy(true)
    setEmailStatus('')
    try {
      await requestJson(`${api}/email`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) }, 30_000)
      setEmailStatus('Email sent. Check your inbox for your report link.')
    } catch (failure) {
      setEmailStatus(failure instanceof Error ? failure.message : 'Could not send the email. Please try again.')
    } finally { setEmailBusy(false) }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-8">
      <Link href="/" className="text-accent font-bold">Future U</Link>
      {!report?.content ? (
        <div className="min-h-[65vh] flex flex-col items-center justify-center text-center gap-5" aria-live="polite">
          {!error && report?.status !== 'failed' && !slow && <Loader2 className="h-10 w-10 animate-spin text-accent" />}
          <h1 className="text-3xl font-bold">{error || report?.status === 'failed' || slow ? 'Your answers are safe' : 'Mapping out your future'}</h1>
          <p className="text-muted-foreground max-w-md">{error || (report?.status === 'failed' ? 'Your report could not finish. Please try again.' : slow ? 'This is taking longer than expected. Keep this link so you can return to your results.' : 'Your results will appear here. No sign-in needed. This usually takes a minute or two.')}</p>
          {(report?.status === 'failed' || report?.stale) && report.canRetry && <Button disabled={busy} onClick={() => void generate()}>Try again</Button>}
          {!report && error && <Button onClick={() => window.location.reload()}>Try again</Button>}
          <Link href="/quiz-selection" className="text-sm underline text-muted-foreground">Back to quizzes</Link>
        </div>
      ) : (
        <>
          <header className="my-10 space-y-4 text-center">
            <h1 className="text-3xl sm:text-4xl font-bold">Your results</h1>
            <p className="mx-auto max-w-2xl leading-relaxed">{report.summary}</p>
          </header>
          <section aria-labelledby="keep-report" className="rounded-2xl border border-accent/40 bg-accent/5 p-5 sm:p-7 space-y-4">
            <h2 id="keep-report" className="text-xl font-bold">Want to keep your report?</h2>
            <p className="text-sm text-muted-foreground">Email yourself a link to reopen it without an account, or sign in to save it to your dashboard and track your goals.</p>
            <form onSubmit={sendEmail} className="space-y-2">
              <label htmlFor="report-email" className="block text-sm">Your email</label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input id="report-email" type="email" required maxLength={254} autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} className="min-w-0 flex-1 rounded-md border border-input bg-background px-3 py-2" placeholder="you@example.com" />
                <Button disabled={emailBusy} type="submit">{emailBusy ? 'Sending…' : 'Email me my report link'}</Button>
              </div>
            </form>
            {emailStatus && <p role="status" className="text-sm">{emailStatus}</p>}
            <Button variant="outline" disabled={saving || status === 'loading'} onClick={() => void saveReport()}>{saving ? 'Saving…' : status === 'authenticated' ? 'Save to my account' : 'Sign in & save my report'}</Button>
            {saveError && <p role="alert" className="text-sm text-destructive">{saveError}</p>}
            <p className="text-xs text-muted-foreground">If you leave without keeping the link or saving your report, you may not be able to find it again. Anyone with the link can view your report, so keep it private.</p>
          </section>
          {report.checkpoints.length > 0 ? <StrategyCircles checkpoints={report.checkpoints} allowGoalEditing={false} /> : (
            <section className="py-8 text-center space-y-3" aria-live="polite">
              <h2 className="text-2xl font-bold">Your roadmap</h2>
              <p className="text-muted-foreground">{report.timelineError ? 'Your results are ready, but the roadmap could not finish.' : 'Your roadmap is still being generated. You can read your results below.'}</p>
              {(report.timelineError || report.stale || report.status === 'failed') && report.canRetry && <Button variant="outline" disabled={busy} onClick={() => void generate(true)}>Retry roadmap</Button>}
              {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            </section>
          )}
          <article className="mx-auto max-w-2xl py-8 leading-relaxed break-words">
            <ReactMarkdown components={{
              h2: props => <h2 className="text-2xl font-bold mt-10 mb-5" {...props} />,
              p: props => <p className="my-4 text-foreground/90" {...props} />,
              ul: props => <ul className="list-disc pl-5 my-4 space-y-2" {...props} />,
            }}>{report.content}</ReactMarkdown>
          </article>
        </>
      )}
    </div>
  )
}
