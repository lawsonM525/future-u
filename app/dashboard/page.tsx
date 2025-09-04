'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Timeline } from '@/components/Timeline'
import { TimelineCheckpoint } from '@/types/timeline'
import AvatarCreator from '@/components/AvatarCreator'
import { PlusCircle } from 'lucide-react'
import { GlowCard } from '@/components/ui/GlowCard'
import { XPWidget } from '@/components/dashboard/XPWidget'
import { GoalsWidget } from '@/components/dashboard/GoalsWidget'
import { MagneticButton } from '@/components/ui/MagneticButton'
import { SoundToggle } from '@/components/ui/SoundToggle'

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
          <h2 className="text-2xl font-bold text-red-500">Something Went Wrong</h2>
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

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Hero: Avatar + XP + Quick Actions */}
        <div className="grid md:grid-cols-12 gap-6 items-stretch">
          <GlowCard className="md:col-span-5 p-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-accent">Welcome back, {firstName}</h1>
                <p className="text-muted-foreground text-sm">{session?.user?.email}</p>
              </div>
              <SoundToggle />
            </div>
            <div className="mt-4 flex flex-col items-center">
              <AvatarCreator seed={session?.user?.email || ''} size={180} {...avatarPreferences} />
              <div className="mt-4">
                <MagneticButton onClick={() => router.push('/customize-avatar')} className="px-4 py-2 text-sm">
                  Customize Avatar
                </MagneticButton>
              </div>
            </div>
          </GlowCard>
          <div className="md:col-span-7 space-y-4">
            <XPWidget checkpoints={timeline} />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <MagneticButton onClick={() => router.push('/quiz-selection')} className="w-full">
                Retake Quiz
              </MagneticButton>
              {timeline.length > 0 ? (
                <MagneticButton onClick={() => router.push('/report/latest')} className="w-full">
                  View Career Strategy
                </MagneticButton>
              ) : (
                <MagneticButton onClick={() => router.push('/quiz-selection')} className="w-full">
                  Take Quiz to Get Started
                </MagneticButton>
              )}
              <MagneticButton onClick={() => {
                const el = document.getElementById('goals');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }} className="w-full">
                <PlusCircle className="w-4 h-4 mr-2" /> Add Goal
              </MagneticButton>
            </div>
          </div>
        </div>

        {/* Goals */}
        <GoalsWidget />

        {/* Timeline */}
        {timeline.length > 0 ? (
          <Timeline checkpoints={timeline} />
        ) : (
          <GlowCard className="p-8 text-center">
            <p className="text-muted-foreground">Take a quiz to generate your personalized career timeline!</p>
          </GlowCard>
        )}
      </div>
    </div>
  )
}
