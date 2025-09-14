'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { GlowCard } from '@/components/ui/GlowCard'
import { Button } from '@/components/ui/button'
import { ArrowLeft, CheckCircle2, Sparkles } from 'lucide-react'

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

  const isPremiumMonthly = data?.subscriptionTier === 'premium' && data.subscriptionInterval === 'monthly'
  const isPremiumAnnual = data?.subscriptionTier === 'premium' && data.subscriptionInterval === 'annual'
  const isPremium = (data?.subscriptionTier === 'premium') || (session?.user?.subscriptionTier === 'premium')

  // Simple sparkle burst before redirect
  const [showBurst, setShowBurst] = useState(false)
  const handleStartMonthly = () => {
    setShowBurst(true)
    setTimeout(() => updatePlan('premium', 'monthly'), 450)
    setTimeout(() => setShowBurst(false), 1200)
  }
  const handleGoAnnual = () => {
    setShowBurst(true)
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

  // Plan badge styling from session
  const planTier: 'free' | 'premium' = session?.user?.subscriptionTier === 'premium' ? 'premium' : 'free'
  const planLabel = planTier === 'premium' ? 'Premium' : 'BASIC'
  const planBadgeClasses = planTier === 'premium'
    ? 'bg-canary/15 border border-canary text-canary'
    : 'bg-fluorescent-cyan/15 border border-fluorescent-cyan text-fluorescent-cyan'

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
              <span className={`text-[10px] py-0.5 px-2 rounded-full ${planBadgeClasses}`}>{planLabel}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">{session?.user?.name || 'Your Account'}</span>
              <span className={`text-[10px] py-0.5 px-2 rounded-full ${planBadgeClasses}`}>{planLabel}</span>
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
            <div className="mt-8 space-y-8">
              <div className="grid gap-5 md:grid-cols-3">
                {/* Premium plan (dominant) */}
                <div className="relative md:col-span-2 rounded-xl p-6 ring-1 ring-canary/50 bg-gradient-to-b from-black/40 via-black/30 to-black/20 hover:shadow-[0_0_32px_rgba(254,228,2,0.22)] transition-shadow">
                  <div className="absolute -top-3 -right-3 rotate-45">
                    <span className="inline-block bg-canary text-black text-[10px] font-semibold py-1 px-3 rounded-sm shadow-black/30 shadow">2 months free</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-lg font-semibold">Premium</div>
                    <span className="text-[10px] py-0.5 px-2 rounded-full bg-canary/20 text-black">Most popular</span>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">Go all in. More tools, more progress, zero commitment.</div>
                  <div className="grid gap-6 sm:grid-cols-2 mt-4">
                    <div>
                      <div className="flex items-baseline gap-2">
                        <div className="text-3xl font-bold">${priceMonthly}</div>
                        <span className="text-[10px] py-0.5 px-2 rounded-full bg-fluorescent-cyan/15 text-fluorescent-cyan">7‑day free trial</span>
                      </div>
                      <div className="text-xs text-muted-foreground">{currency} / month</div>
                      <Button
                        className="mt-3 rounded-full w-full"
                        variant={isPremiumMonthly ? 'default' : 'outline'}
                        disabled={saving}
                        onClick={handleStartMonthly}
                      >
                        {isPremiumMonthly ? 'You’re on this now' : 'Unlock my trial 🚀'}
                      </Button>
                      <div className="text-[11px] text-muted-foreground mt-2 text-center">Cancel anytime with one click</div>
                    </div>
                    <div>
                      <div className="flex items-baseline gap-2">
                        <div className="text-3xl font-bold">${priceAnnual}</div>
                      </div>
                      <div className="text-xs text-muted-foreground">{currency} / year</div>
                      <Button
                        className="mt-3 rounded-full w-full"
                        variant={isPremiumAnnual ? 'default' : 'outline'}
                        disabled={saving}
                        onClick={handleGoAnnual}
                      >
                        {isPremiumAnnual ? 'You’re on this now' : 'Go annual, save big 💸'}
                      </Button>
                    </div>
                  </div>

                  {data.subscriptionTier === 'premium' && (
                    <div className="mt-4 text-xs text-muted-foreground">
                      Next renewal: {nextRenewal || '—'}
                    </div>
                  )}

                  {isPremium && (
                    <div className="mt-4">
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

                {/* Free plan */}
                <div className="rounded-xl bg-black/60 p-6 ring-1 ring-border/60">
                  <div className="text-lg font-semibold">Free</div>
                  <div className="text-sm text-muted-foreground mt-1">Kick off your journey for free.</div>
                  <div className="text-3xl font-bold mt-4">$0</div>
                  <div className="mt-6">
                    <Button className="w-full rounded-full" variant="secondary" disabled>
                      {data.subscriptionTier === 'free' ? 'Your plan today' : 'Manage in billing portal'}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="rounded-xl bg-black/40 p-6 ring-1 ring-border/60 space-y-5">
                <div className="text-base font-semibold">What you get with Premium</div>
                <ul className="grid gap-4 md:grid-cols-2">
                  <li className="flex items-start gap-3">
                    <span className="text-lg">🗡️</span>
                    <div>
                      <div className="text-sm font-medium">Daily Quests</div>
                      <div className="text-xs text-muted-foreground">Get new, focused tasks every day to move closer to your goals.</div>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-lg">🤖</span>
                    <div>
                      <div className="text-sm font-medium flex items-center gap-2">Coach (AI) <span className="text-[10px] py-0.5 px-2 rounded-full bg-canary/20 text-black animate-pulse">Coming soon</span></div>
                      <div className="text-xs text-muted-foreground">Chat with our AI coach to guide action and keep momentum. Launching Fall 2025.</div>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-lg">📧</span>
                    <div>
                      <div className="text-sm font-medium">Weekly Accountability Emails</div>
                      <div className="text-xs text-muted-foreground">Stay on track with friendly reminders and focus for the week.</div>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-lg">📚</span>
                    <div>
                      <div className="text-sm font-medium flex items-center gap-2">Advanced Resources <span className="text-[10px] py-0.5 px-2 rounded-full bg-canary/20 text-black animate-pulse">Coming soon</span></div>
                      <div className="text-xs text-muted-foreground">High‑quality, vetted tools and guides to accelerate progress.</div>
                    </div>
                  </li>
                </ul>

                <div className="space-y-1 text-[11px] text-muted-foreground">
                  <p>* Monthly plan includes a 7‑day free trial. Cancel any time during trial to avoid charges.</p>
                  <p>* Annual plan equals ~2 months free vs. paying monthly.</p>
                </div>
              </div>

              {/* Comparison */}
              <div className="rounded-xl bg-black/40 p-6 ring-1 ring-border/60">
                <div className="text-base font-semibold mb-3">Free vs Premium</div>
                <div className="grid grid-cols-3 text-sm">
                  <div className="font-medium">Feature</div>
                  <div className="text-center font-medium">Free</div>
                  <div className="text-center font-medium">Premium</div>
                  <div className="col-span-3 h-px bg-border/60 my-2" />
                  <div>Daily Quests</div>
                  <div className="text-center">—</div>
                  <div className="text-center">✅</div>
                  <div>Weekly Emails</div>
                  <div className="text-center">—</div>
                  <div className="text-center">✅</div>
                  <div>Coach (AI)</div>
                  <div className="text-center">Coming soon</div>
                  <div className="text-center">Coming soon</div>
                  <div>Advanced Resources</div>
                  <div className="text-center">Coming soon</div>
                  <div className="text-center">Coming soon</div>
                </div>
              </div>
            </div>
          ) : null}
        </GlowCard>
      </div>
    </div>
  )
}
