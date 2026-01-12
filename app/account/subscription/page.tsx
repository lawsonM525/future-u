'use client'

import { useEffect, useMemo, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { GlowCard } from '@/components/ui/GlowCard'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Sparkles } from 'lucide-react'

type SubResponse = {
  subscriptionTier: 'free' | 'premium'
  subscriptionInterval: 'monthly' | 'annual' | null
  subscriptionCurrentPeriodEnd: string | null
  prices: {
    monthly: number
    annual: number
    currency: string
  }
}

export default function SubscriptionPage() {
  const router = useRouter()
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/login')
    },
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<SubResponse | null>(null)
  const [goalCount, setGoalCount] = useState<number | null>(null)

  // DataFast tracking helper
  const track = useCallback((goal: string, params?: Record<string, string | undefined>) => {
    try {
      if (typeof window !== 'undefined' && typeof window.datafast === 'function') {
        const cleaned: Record<string, string> = {}
        if (params) {
          for (const [k, v] of Object.entries(params)) {
            if (v !== undefined && v !== null) cleaned[k] = String(v)
          }
        }
        window.datafast(goal, cleaned)
      }
    } catch {}
  }, [])
  const [selectedInterval, setSelectedInterval] = useState<'monthly' | 'annual'>('monthly')

  useEffect(() => {
    if (status !== 'authenticated') return
    let cancelled = false
    const load = async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/subscription', { cache: 'no-store' })
        const json = await res.json()
        if (cancelled) return
        if (res.ok) {
          setData(json)
        } else {
          setError(json?.error || 'Failed to load subscription')
        }
      } catch {
        setError('Failed to load subscription')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [status])

  // Load user's goal count for personalization
  useEffect(() => {
    if (status !== 'authenticated') return
    let cancelled = false
    const loadGoals = async () => {
      try {
        const res = await fetch('/api/goals/count', { cache: 'no-store' })
        const json = await res.json()
        if (cancelled) return
        if (res.ok && typeof json.count === 'number') {
          setGoalCount(json.count)
        }
      } catch {
        // silent fail, personalization is optional
      }
    }
    loadGoals()
    return () => {
      cancelled = true
    }
  }, [status])

  const refresh = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('/api/subscription', { cache: 'no-store' })
      const json = await res.json()
      if (res.ok) {
        setData(json)
      } else {
        setError(json?.error || 'Failed to load subscription')
      }
    } catch {
      setError('Failed to load subscription')
    } finally {
      setLoading(false)
    }
  }

  const currency = data?.prices.currency || 'USD'
  const priceMonthly = useMemo(() => (data ? data.prices.monthly.toFixed(2) : '14.99'), [data])
  const priceAnnual = useMemo(() => (data ? data.prices.annual.toFixed(2) : '149.00'), [data])
  const isPremium = (data?.subscriptionTier === 'premium') || (session?.user?.subscriptionTier === 'premium')

  // Track pricing page opened
  useEffect(() => {
    if (status !== 'authenticated') return
    const user_id = session?.user?.id ? String(session.user.id) : undefined
    const email = session?.user?.email ? String(session.user.email) : undefined
    const referrer = typeof document !== 'undefined' && document.referrer ? document.referrer : undefined
    track('pricing_opened', { user_id, email, referrer })
  }, [status, session, track])

  // Detect abandoned checkout attempts (user clicked checkout but is not premium after 30 minutes)
  useEffect(() => {
    if (status !== 'authenticated') return
    if (typeof window === 'undefined') return
    try {
      const startedAt = localStorage.getItem('df_checkout_started_at')
      const plan = localStorage.getItem('df_checkout_plan') || undefined
      if (!startedAt) return
      const t = Number(startedAt)
      const THIRTY_MIN = 30 * 60 * 1000
      if (Date.now() - t >= THIRTY_MIN && !isPremium) {
        const user_id = session?.user?.id ? String(session.user.id) : undefined
        const email = session?.user?.email ? String(session.user.email) : undefined
        track('checkout_abandoned', { user_id, email, plan: plan || undefined, started_at: String(t) })
        localStorage.removeItem('df_checkout_started_at')
        localStorage.removeItem('df_checkout_plan')
      }
    } catch {}
  }, [status, isPremium, session, track])

  // Simple sparkle burst before redirect
  const [showBurst, setShowBurst] = useState(false)
  const handleStartMonthly = () => {
    setShowBurst(true)
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('df_checkout_started_at', String(Date.now()))
        localStorage.setItem('df_checkout_plan', 'monthly')
      }
      const user_id = session?.user?.id ? String(session.user.id) : undefined
      const email = session?.user?.email ? String(session.user.email) : undefined
      track('checkout_initiated', { user_id, email, plan: 'monthly', price: priceMonthly, currency })
    } catch {}
    setTimeout(() => updatePlan('premium', 'monthly'), 450)
    setTimeout(() => setShowBurst(false), 1200)
  }
  const handleGoAnnual = () => {
    setShowBurst(true)
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('df_checkout_started_at', String(Date.now()))
        localStorage.setItem('df_checkout_plan', 'annual')
      }
      const user_id = session?.user?.id ? String(session.user.id) : undefined
      const email = session?.user?.email ? String(session.user.email) : undefined
      track('checkout_initiated', { user_id, email, plan: 'annual', price: priceAnnual, currency })
    } catch {}
    setTimeout(() => updatePlan('premium', 'annual'), 450)
    setTimeout(() => setShowBurst(false), 1200)
  }

  const updatePlan = async (tier: 'free' | 'premium', interval?: 'monthly' | 'annual') => {
    try {
      setSaving(true)
      setError(null)
      if (tier === 'free') {
        const res = await fetch('/api/subscription', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tier: 'free', interval: null }),
        })
        const json = await res.json()
        if (!res.ok) {
          setError(json?.error || 'Failed to update subscription')
          return
        }
        setData((prev) => prev ? {
          ...prev,
          subscriptionTier: json.subscriptionTier,
          subscriptionInterval: json.subscriptionInterval,
          subscriptionCurrentPeriodEnd: json.subscriptionCurrentPeriodEnd,
        } : {
          subscriptionTier: json.subscriptionTier,
          subscriptionInterval: json.subscriptionInterval,
          subscriptionCurrentPeriodEnd: json.subscriptionCurrentPeriodEnd,
          prices: { monthly: 14.99, annual: 149.0, currency: 'USD' }
        })
      } else {
        // Redirect to Stripe Payment Link
        const monthlyLink = process.env.NEXT_PUBLIC_STRIPE_PL_MONTHLY || 'https://buy.stripe.com/4gMfZh6Cjd211q3cdo8ww00'
        const annualLink = process.env.NEXT_PUBLIC_STRIPE_PL_ANNUAL || 'https://buy.stripe.com/bJecN5f8P0ff1q33GS8ww01'
        const base = interval === 'annual' ? annualLink : monthlyLink
        const email = (session?.user?.email ?? undefined) as string | undefined
        const url = email ? `${base}?prefilled_email=${encodeURIComponent(email)}` : base
        if (typeof window !== 'undefined') {
          window.location.href = url
        }
      }
    } catch {
      setError('Failed to update subscription')
    } finally {
      setSaving(false)
    }
  }

  const nextRenewal = data?.subscriptionCurrentPeriodEnd
    ? new Date(data.subscriptionCurrentPeriodEnd).toLocaleDateString()
    : null


  return (
    <div className="min-h-screen bg-night text-foreground px-3 md:px-6 lg:px-8 py-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <GlowCard className="relative overflow-hidden p-6 md:p-8">
          {showBurst && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-canary animate-ping" />
            </div>
          )}
          {/* Header row with back link and optional portal link */}
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to dashboard</span>
            </Link>
            {isPremium && (
              <a
                href="https://billing.stripe.com/p/login/4gMfZh6Cjd211q3cdo8ww00"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm underline hover:no-underline"
              >
                Manage billing
              </a>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">Manage Subscription</h1>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">{session?.user?.name || 'Your Account'}</span>
            </div>
            <p className="text-sm text-muted-foreground">Choose the plan that fits you. Upgrade or downgrade anytime.</p>
            <div>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={refresh}
                disabled={loading}
              >
                Refresh status
              </Button>
            </div>
            
          </div>

          {loading ? (
            <div className="mt-8">Loading...</div>
          ) : error ? (
            <div className="mt-6 text-sm text-destructive">{error}</div>
          ) : data ? (
            <div className="mt-8 space-y-6 max-w-md mx-auto">
              {/* Callout replacing reminder */}
              {typeof goalCount === 'number' && (
                <div className="rounded-xl p-4 bg-gradient-to-b from-fluorescent-cyan/10 to-transparent ring-1 ring-fluorescent-cyan/30 flex items-start gap-3">
                  <div className="mt-0.5"><Sparkles className="w-5 h-5 text-fluorescent-cyan" /></div>
                  <div className="text-sm leading-snug">
                    <span className="text-muted-foreground">You have </span>
                    <span className="text-fluorescent-cyan font-semibold">{goalCount}</span>
                    <span className="text-muted-foreground"> goals — achieve them all with Daily Quests and more.</span>
                  </div>
                </div>
              )}

              {/* Features (concise) */}
              <div className="rounded-xl ring-1 ring-border/60 divide-y divide-border/40 overflow-hidden bg-black/40">
                <div className="flex items-start gap-3 p-4">
                  <div className="w-8 h-8 rounded-full bg-fluorescent-cyan/15 flex items-center justify-center">🗡️</div>
                  <div>
                    <div className="text-sm font-medium">Daily Quests</div>
                        <div className="text-xs text-muted-foreground">Focused tasks every day to move closer to your goals.</div>
                      </div>
                </div>
                {/*weekly emails*/}
                <div className="flex items-start gap-3 p-4">
                  <div className="w-8 h-8 rounded-full bg-fluorescent-cyan/15 flex items-center justify-center">🗡️</div>
                  <div>
                    <div className="text-sm font-medium">Accountability Emails</div>
                    <div className="text-xs text-muted-foreground">Weekly emails to keep you on track.</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-4">
                  <div className="w-8 h-8 rounded-full bg-canary/20 flex items-center justify-center">🤖</div>
                  <div>
                    <div className="text-sm font-medium flex items-center gap-2">Coach (AI) <span className="text-[10px] py-0.5 px-2 rounded-full bg-canary/25 text-black">Coming soon</span></div>
                    <div className="text-xs text-muted-foreground">Chat with our AI coach to guide action and keep momentum.</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4">
                  <div className="w-8 h-8 rounded-full bg-canary/20 flex items-center justify-center">📚</div>
                  <div>
                    <div className="text-sm font-medium flex items-center gap-2">Advanced Resources <span className="text-[10px] py-0.5 px-2 rounded-full bg-canary/25 text-black">Coming soon</span></div>
                    <div className="text-xs text-muted-foreground">High‑quality, vetted tools and guides to accelerate progress.</div>
                  </div>
                </div>
              </div>

              {/* Price selection */}
              <div className="rounded-xl ring-1 ring-border/60 bg-black/40 p-3 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedInterval('monthly')}
                    className={`text-left rounded-xl p-3 ring-1 transition ${selectedInterval === 'monthly' ? 'ring-fluorescent-cyan/50 bg-fluorescent-cyan/10' : 'ring-border/40 hover:bg-white/5'}`}
                  >
                    <div className="text-xs text-muted-foreground">Monthly</div>
                    <div className="mt-1 flex items-baseline gap-2">
                      <div className="text-xl font-bold">${priceMonthly}</div>
                      <span className="text-[10px] py-0.5 px-2 rounded-full bg-fluorescent-cyan/15 text-fluorescent-cyan">7‑day free trial</span>
                    </div>
                    <div className="text-[11px] text-muted-foreground">{currency} / month</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedInterval('annual')}
                    className={`text-left rounded-xl p-3 ring-1 transition relative ${selectedInterval === 'annual' ? 'ring-canary/60 bg-canary/10' : 'ring-border/40 hover:bg-white/5'}`}
                  >
                    <div className="absolute -top-3 right-2"><span className="text-[10px] py-0.5 px-2 rounded bg-canary text-black">Best value</span></div>
                    <div className="text-xs text-muted-foreground">Annual</div>
                    <div className="mt-1 flex items-baseline gap-2">
                      <div className="text-xl font-bold">${priceAnnual}</div>
                      <span className="text-[10px] py-0.5 px-2 rounded-full bg-canary/25 text-black">2 months free</span>
                    </div>
                    <div className="text-[11px] text-muted-foreground">{currency} / year</div>
                  </button>
                </div>
                <Button
                  className="w-full rounded-full h-11 text-base"
                  onClick={() => (selectedInterval === 'annual' ? handleGoAnnual() : handleStartMonthly())}
                  disabled={saving}
                >
                  {selectedInterval === 'annual' ? 'Go annual, save big 💸' : 'Try for free'}
                </Button>
                <div className="text-[11px] text-muted-foreground text-center">Cancel anytime. Plans renew automatically.</div>
                {data.subscriptionTier === 'premium' && (
                  <div className="mt-1 text-center text-[11px] text-muted-foreground">Next renewal: {nextRenewal || '—'}</div>
                )}
              </div>

              {isPremium && (
                <div className="text-center">
                  <a
                    href="https://billing.stripe.com/p/login/4gMfZh6Cjd211q3cdo8ww00"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm underline hover:no-underline"
                  >
                    Manage your subscription in the billing portal
                  </a>
                </div>
              )}
            </div>
          ) : null}
        </GlowCard>
      </div>
    </div>
  )
}
