'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { SidebarNav } from '@/components/dashboard/SidebarNav'
import { StrategyCircles } from '@/components/dashboard/StrategyCircles'
import { DailyQuests } from '@/components/dashboard/DailyQuests'
import { TimelineCheckpoint } from '@/types/timeline'
import AvatarCreator from '@/components/AvatarCreator'
import { motion, Variants } from 'framer-motion'
import { GlowCard } from '@/components/ui/GlowCard'
import { SoundToggle } from '@/components/ui/SoundToggle'
import { useMediaQuery } from '@/hooks/use-media-query'
import { MobileBottomNav } from '@/components/dashboard/MobileBottomNav'
import { DashboardSection } from '@/components/dashboard/nav'
import StrategyStructuredReport from '@/components/dashboard/StrategyStructuredReport'
import StrategyVisionIntro from '@/components/dashboard/StrategyVisionIntro'
import GoalsTab from '@/components/dashboard/GoalsTab'
import ResourcesTab from '@/components/dashboard/ResourcesTab'
import QuestsTab from '@/components/dashboard/QuestsTab'



function TabSyncer({ onChange }: { onChange: (tab: DashboardSection) => void }) {
  const searchParams = useSearchParams()
  useEffect(() => {
    // Sync tab from URL search param (e.g., ?tab=quests) and react to changes
    const tab = searchParams.get('tab') as DashboardSection | null
    if (tab && ['strategy','goals','quests','resources','feedback','account','coach','friends'].includes(tab)) {
      onChange(tab)
    }
  }, [searchParams, onChange])
  return null
}

export default function DashboardPage() {
  const router = useRouter()
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/login')
    },
  })
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeline, setTimeline] = useState<TimelineCheckpoint[]>([])
  const [isGeneratingTimeline, setIsGeneratingTimeline] = useState(false)
  const [avatarPreferences, setAvatarPreferences] = useState({})
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const [active, setActive] = useState<DashboardSection>('strategy')
  const [archetypeTag, setArchetypeTag] = useState<string | null>(null)
  const generationStartedRef = useRef(false)

  // Get first name only
  const firstName = session?.user?.name ? session.user.name.split(' ')[0] : ''

  // Tab is now synchronized via TabSyncer wrapped in Suspense

  useEffect(() => {
    // Load avatar preferences from localStorage
    if (typeof window !== 'undefined') {
      const savedPreferences = localStorage.getItem('avatarPreferences')
      if (savedPreferences) {
        try {
          setAvatarPreferences(JSON.parse(savedPreferences))
        } catch (e) {
          console.error('Error parsing avatar preferences:', e)
        }
      }
    }
  }, [])

  useEffect(() => {
    if (!session?.user) return

    let cancelled = false
    let pollTimer: ReturnType<typeof setInterval> | null = null

    const loadOrGenerateTimeline = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/get-timeline')
        const data = await response.json()

        if (cancelled) return

        if (response.ok) {
          const hasTimeline = Array.isArray(data.checkpoints) && data.checkpoints.length > 0
          if (hasTimeline) {
            setTimeline(data.checkpoints)
            setIsGeneratingTimeline(false)
            return
          }

          // No timeline yet — trigger generation once, then poll
          if (!generationStartedRef.current) {
            generationStartedRef.current = true
            setIsGeneratingTimeline(true)
            try {
              // Fetch the latest report to get its ID
              const repRes = await fetch('/api/get-report')
              if (repRes.ok) {
                const rep = await repRes.json()
                // Fire & await generation request (do not block further)
                await fetch('/api/generate-timeline', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ reportId: rep.reportId })
                }).catch(() => { /* ignore */ })

                // Start polling for up to ~90s (36 attempts at 2.5s)
                let attempts = 0
                pollTimer = setInterval(async () => {
                  attempts++
                  try {
                    const pr = await fetch('/api/get-timeline')
                    const pd = await pr.json()
                    if (cancelled) return
                    const ready = pr.ok && Array.isArray(pd.checkpoints) && pd.checkpoints.length > 0
                    if (ready) {
                      setTimeline(pd.checkpoints)
                      setIsGeneratingTimeline(false)
                      if (pollTimer) clearInterval(pollTimer)
                    } else if (attempts >= 36) {
                      // Give up after 90s
                      setIsGeneratingTimeline(false)
                      if (pollTimer) clearInterval(pollTimer)
                    }
                  } catch {
                    if (attempts >= 36 && pollTimer) {
                      clearInterval(pollTimer)
                      setIsGeneratingTimeline(false)
                    }
                  }
                }, 2500)
              } else {
                // No report — cannot generate timeline yet
                setIsGeneratingTimeline(false)
              }
            } catch (e) {
              console.error('Failed to initiate timeline generation from dashboard:', e)
              setIsGeneratingTimeline(false)
            }
          }
        } else {
          setError(data.error)
        }
      } catch (error) {
        console.error('Error:', error)
        setError('Failed to load timeline')
      } finally {
        setLoading(false)
      }
    }

    loadOrGenerateTimeline()

    return () => {
      cancelled = true
      if (pollTimer) clearInterval(pollTimer)
    }
  }, [session])

  useEffect(() => {
    // Load archetype tag for display beneath the user's name
    const loadReportMeta = async () => {
      try {
        const res = await fetch('/api/get-report')
        if (!res.ok) return
        const data = await res.json()
        if (typeof data.archetypeTag === 'string' && data.archetypeTag.trim()) {
          setArchetypeTag(data.archetypeTag.trim())
        }
      } catch (e) {
        console.error('Failed to load archetypeTag', e)
      }
    }
    if (session?.user) loadReportMeta()
  }, [session])

  const formatTag = (tag: string) =>
    tag
      .split(' ')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ')


  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
        <h2 className="text-2xl font-bold text-center">Loading Your Dashboard</h2>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 space-y-4">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-destructive">Something Went Wrong</h2>
          <p className="text-muted-foreground max-w-md mx-auto">{error}</p>
          <Button 
            onClick={() => router.refresh()}
            className="bg-accent text-accent-foreground hover:bg-accent/90"
          >
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  }

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } },
  }

  const showLegacy = false

  return (
    <div className="min-h-screen bg-night text-foreground px-3 md:px-6 lg:px-8 py-4 pb-24 md:pb-4">
      <Suspense fallback={null}>
        <TabSyncer onChange={setActive} />
      </Suspense>
      <div className="max-w-7xl xl:max-w-[1400px] mx-auto space-y-8">
        {/* New 3-column layout */}
        <div
          className="grid md:grid-cols-[240px,1fr,300px] lg:grid-cols-[260px,1fr,340px] gap-6 items-start"
        >
          {/* Left sidebar (sticky) */}
          {/* Apply sticky to wrapper to ensure reliable behavior across browsers */}
          <div className="hidden md:block sticky top-4">
            <SidebarNav active={active} onChange={setActive} />
          </div>

          {/* Center: Strategy or Goals content */}
          <motion.div variants={itemVariants} className="space-y-4">
            {active === 'strategy' ? (
              <>
                <StrategyCircles checkpoints={timeline} intro={<StrategyVisionIntro />} isGenerating={isGeneratingTimeline} />
                <StrategyStructuredReport />
              </>
            ) : active === 'goals' ? (
              <GoalsTab />
            ) : active === 'quests' ? (
              <QuestsTab />
            ) : active === 'resources' ? (
              <ResourcesTab />
            ) : active === 'account' ? (
              <GlowCard className="p-10">
                <div className="max-w-2xl mx-auto">
                  <div className="text-lg font-semibold mb-2">Account</div>
                  <p className="text-sm text-muted-foreground mb-6">Manage your profile, sound, and subscription.</p>
                  <div className="flex items-center justify-between mb-4">
                    <SoundToggle />
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full"
                      onClick={() => signOut({ callbackUrl: '/' })}
                    >
                      Sign Out
                    </Button>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <AvatarCreator seed={session?.user?.email || ''} size={140} {...avatarPreferences} />
                    <div className="mt-3">
                      <div className="font-semibold">
                        <span>{session?.user?.name || 'Your Avatar'}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">{archetypeTag ? formatTag(archetypeTag) : 'The Adventurer'}</div>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full px-4"
                        onClick={() => router.push('/customize-avatar')}
                      >
                        Customize Avatar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full px-4"
                        onClick={() => router.push('/account/subscription')}
                      >
                        Manage Subscription
                      </Button>
                    </div>
                  </div>
                </div>
              </GlowCard>
            ) : active === 'coach' ? (
              <GlowCard className="p-10">
                <div className="max-w-2xl mx-auto">
                  <div className="text-lg font-semibold">Coach</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    An AI chatbot coach to guide you in putting your strategy into action.
                  </p>
                  <div className="mt-6 space-y-3">
                    <div className="font-medium">Coming soon:</div>
                    <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                      <li>Get step-by-step guidance on implementing your career strategy.</li>
                      <li>Review weekly progress with suggestions to do even better.</li>
                      <li>Optimize your resume and LinkedIn so they align with your strategy.</li>
                      <li>Generate practical, bite-sized action items to build your dream life.</li>
                    </ul>
                  </div>
                </div>
              </GlowCard>
            ) : active === 'friends' ? (
              <GlowCard className="p-10">
                <div className="max-w-2xl mx-auto">
                  <div className="text-lg font-semibold">Friends</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Make friends on Future U, stay accountable together, and celebrate progress.
                  </p>
                  <div className="mt-6 space-y-3">
                    <div className="font-medium">Coming soon:</div>
                    <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                      <li>Add friends and form accountability partners or pods.</li>
                      <li>See how your friends are keeping up with their daily quests.</li>
                      <li>Share wins, give encouragement, and celebrate milestones.</li>
                      <li>Control what you share with simple privacy settings.</li>
                    </ul>
                  </div>
                </div>
              </GlowCard>
            ) : (
              <GlowCard className="p-10 text-center">
                <div className="text-lg font-semibold capitalize">{active.replace('-', ' ')}</div>
                <p className="text-sm text-muted-foreground mt-1">Coming soon.</p>
              </GlowCard>
            )}
          </motion.div>

          {/* Right: Avatar + Daily Quests */}
          <div className="hidden md:block space-y-4 md:sticky md:top-4">
            <GlowCard className="p-5 flex flex-col items-center text-center">
              <div className="mb-3 md:mb-4 w-full flex items-center justify-end gap-2">
                <SoundToggle />
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  onClick={() => signOut({ callbackUrl: '/' })}
                >
                  Sign Out
                </Button>
              </div>
              <AvatarCreator seed={session?.user?.email || ''} size={isDesktop ? 180 : 140} {...avatarPreferences} />
              <div className="mt-3 md:mt-4">
                <div className="font-semibold">
                  <span>{session?.user?.name || 'Your Avatar'}</span>
                </div>
                <div className="text-xs text-muted-foreground">{archetypeTag ? formatTag(archetypeTag) : 'The Adventurer'}</div>
              </div>
              <div className="mt-3 md:mt-4 flex flex-col items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full px-4"
                  onClick={() => router.push('/customize-avatar')}
                >
                  Customize Avatar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full px-4"
                  onClick={() => router.push('/quiz-selection')}
                >
                  Retake Quiz
                </Button>
              </div>
            </GlowCard>

            <DailyQuests />
          </div>
        </div>

        {/* Legacy layout gated for now */}
        {showLegacy && (
        <motion.div
          className="grid md:grid-cols-12 gap-6 items-stretch"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="md:col-span-5">
            <GlowCard className="p-6 h-full flex flex-col">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-accent">Welcome back, {firstName}</h1>
                <p className="text-muted-foreground text-sm">{session?.user?.email}</p>
              </div>
              <SoundToggle />
            </div>
            <div className="mt-4 flex flex-col items-center">
              <AvatarCreator seed={session?.user?.email || ''} size={isDesktop ? 180 : 120} {...avatarPreferences} />
              <div className="mt-4">
                <Button onClick={() => router.push('/customize-avatar')} className="px-4 py-2 text-sm">
                  Customize Avatar
                </Button>
              </div>
            </div>
            </GlowCard>
          </motion.div>
          <motion.div variants={itemVariants} className="md:col-span-7 space-y-4 flex flex-col">
            <GlowCard className="p-8 text-center">
              <p className="text-muted-foreground">Legacy content area</p>
            </GlowCard>
          </motion.div>
        </motion.div>
        )}

        {/* Goals */}
        {/* <GoalsWidget />  */}
        {/* Mobile bottom nav */}
        <div className="md:hidden">
          <MobileBottomNav active={active} onChange={(k) => setActive(k)} />
        </div>
      </div>
    </div>
  )
}
