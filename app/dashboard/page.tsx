'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Timeline } from '@/components/Timeline'
import { TimelineCheckpoint } from '@/models/Timeline'
import AvatarCreator from '@/components/AvatarCreator'

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
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <Card className="border-accent">
          <CardHeader>
            <div className="flex items-center gap-6">
              <AvatarCreator seed={session?.user?.email || ''} size={80} />
              <div>
                <CardTitle className="text-2xl font-bold text-accent">
                  Welcome Back{session?.user?.name ? `, ${session.user.name}` : ''}
                </CardTitle>
                <p className="text-muted-foreground">{session?.user?.email}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Button
                onClick={() => router.push('/quiz-selection')}
                className="bg-accent text-accent-foreground hover:bg-accent/90"
              >
                Take Quiz
              </Button>
              {timeline.length > 0 && (
                <Button
                  variant="outline"
                  className="border-accent hover:bg-accent/20"
                  onClick={() => router.push('/report/latest')}
                >
                  View Career Strategy
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {timeline.length > 0 ? (
          <Timeline checkpoints={timeline} />
        ) : (
          <Card className="border-accent bg-card/50">
            <CardContent className="p-8 text-center space-y-4">
              <p className="text-muted-foreground">Take a quiz to generate your personalized career timeline!</p>
              <Button
                onClick={() => router.push('/quiz-selection')}
                className="bg-accent text-accent-foreground hover:bg-accent/90"
              >
                Start Quiz
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
