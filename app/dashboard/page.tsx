'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
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

// TODO: Make dashboard responsive for only mobile
// TODO: Add title of "Your Strategy" to strategy section
// TODO: Strategy section should have more info/checkpoints 
// TODO: Add goals button + popup to approove, edit or add goals as they want
// TODO: Add database functionality for adding goals
// (AI generates goals from strategy sections)
// TODO: Add functionality for adding daily quests
// (AI generates daily quests from goals and everything can be stored and tracked)
// TODO: If user has no quests, no daily quests should be displayed in quests card
// TODO: Add more details to coming soon for coach and friends so users know what to expect
// TODO: Clicking feedback should redirect to featurebase


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
  const [avatarPreferences, setAvatarPreferences] = useState({})
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const [active, setActive] = useState<DashboardSection>('strategy')

  // Get first name only
  const firstName = session?.user?.name ? session.user.name.split(' ')[0] : ''

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
    const fetchTimeline = async () => {
      try {
        const response = await fetch('/api/get-timeline')
        const data = await response.json()
        
        if (response.ok) {
          setTimeline(data.checkpoints)
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

    if (session?.user) {
      fetchTimeline()
    }
  }, [session])

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

          {/* Center: Strategy view or placeholders for other sections */}
          <motion.div variants={itemVariants} className="space-y-4">
            {active === 'strategy' ? (
              <>
                <StrategyCircles checkpoints={timeline} intro={<StrategyVisionIntro />} />
                <StrategyStructuredReport />
              </>
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
              <div className="mb-3 md:mb-4"><SoundToggle /></div>
              <AvatarCreator seed={session?.user?.email || ''} size={isDesktop ? 180 : 140} {...avatarPreferences} />
              <div className="mt-3 md:mt-4">
                <div className="font-semibold">{session?.user?.name || 'Your Avatar'}</div>
                <div className="text-xs text-muted-foreground">The Adventurer</div>
              </div>
              <Button variant="outline" size="sm" className="mt-3 md:mt-4 rounded-full px-4" onClick={() => router.push('/customize-avatar')}>
                Customize Avatar
              </Button>
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
          <MobileBottomNav active={active} onChange={setActive} />
        </div>
      </div>
    </div>
  )
}
