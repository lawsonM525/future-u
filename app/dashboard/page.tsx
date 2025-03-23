'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Timeline } from '@/components/Timeline'
import { TimelineCheckpoint } from '@/models/Timeline'
import AvatarCreator from '@/components/AvatarCreator'
import { ArrowRight } from 'lucide-react'

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

  // Get first name only
  const firstName = session?.user?.name ? session.user.name.split(' ')[0] : ''

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
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Welcome Card - Full Width */}
        <Card className="w-full">
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-full md:w-1/3 flex justify-center">
                <AvatarCreator seed={session?.user?.email || ''} size={180} />
              </div>
              <div className="w-full md:w-2/3 space-y-4 text-center md:text-left">
                <CardTitle className="text-3xl font-bold text-accent">
                  Welcome Back, {firstName}
                </CardTitle>
                <p className="text-muted-foreground">{session?.user?.email}</p>
                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                  <Button
                    onClick={() => router.push('/customize-avatar')}
                    variant="outline"
                    size="sm"
                    className="rounded-full text-sm px-4 py-1 h-8 hover:bg-accent/20"
                  >
                    Customize Avatar
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Career Strategy Card */}
        <Card>
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-full space-y-4">
                <h3 className="text-2xl font-bold text-accent">Your Career Strategy</h3>
                <p className="text-muted-foreground">
                  Your career strategy is your comprehensive report that shows you your strengths 
                  and exactly how you're going to get from present you to future you.
                </p>
                <div className="flex justify-start pt-2">
                  {timeline.length > 0 ? (
                    <Button
                      className="bg-accent text-accent-foreground hover:bg-accent/90 flex items-center gap-2"
                      onClick={() => router.push('/report/latest')}
                    >
                      View Career Strategy
                      <ArrowRight size={16} />
                    </Button>
                  ) : (
                    <Button
                      className="bg-accent text-accent-foreground hover:bg-accent/90 flex items-center gap-2"
                      onClick={() => router.push('/quiz-selection')}
                    >
                      Take Quiz to Get Started
                      <ArrowRight size={16} />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {timeline.length > 0 ? (
          <Timeline checkpoints={timeline} />
        ) : (
          <Card className="bg-card/50">
            <CardContent className="p-8 text-center space-y-4">
              <p className="text-muted-foreground">Take a quiz to generate your personalized career timeline!</p>
            </CardContent>
          </Card>
        )}
        
        {/* Retake Quiz Button - Full Width */}
        {timeline.length > 0 && (
          <Card className="mt-6">
            <CardContent className="p-6">
              <Button
                onClick={() => router.push('/quiz-selection')}
                variant="outline"
                className="w-full hover:bg-accent/20"
              >
                Retake Quiz
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
