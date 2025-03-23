'use client'

import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'

export default function ReportPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [report, setReport] = useState<{ content: string; createdAt: string } | null>(null)

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
          <Button asChild variant="outline" className="border-accent hover:bg-accent/20">
            <Link href="/quiz-selection">Take the Quiz</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center mt-8">
          <Button
            variant="outline"
            className="border-accent hover:bg-accent/20"
            onClick={() => router.push('/dashboard')}
          >
            Go to Dashboard
          </Button>
          <Button
            variant="outline"
            className="border-accent hover:bg-accent/20"
            onClick={() => router.push('/quiz-selection')}
          >
            Retake Quiz
          </Button>
        </div>
        <Card className="border-accent bg-card">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl font-bold text-accent">Your Career Strategy</CardTitle>
            {session?.user && (
              <CardDescription className="text-muted-foreground">
                Prepared for {session.user.name}
                {report?.createdAt && (
                  <span className="ml-2">
                    on {new Date(report.createdAt).toLocaleDateString()}
                  </span>
                )}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-8">
            {report?.content ? (
              <div className="prose prose-invert max-w-none space-y-4">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    p: ({...props}) => <p className="text-muted-foreground leading-relaxed" {...props} />,
                    strong: ({...props}) => <strong className="text-accent font-semibold" {...props} />,
                    h2: ({...props}) => <h2 className="text-2xl font-semibold text-accent mt-8 mb-4" {...props} />,
                    h3: ({...props}) => <h3 className="text-lg font-semibold text-accent mt-6 mb-2" {...props} />,
                    ul: ({...props}) => <ul className="list-disc list-inside space-y-2" {...props} />,
                    li: ({...props}) => <li className="text-muted-foreground" {...props} />
                  }}
                >
                  {report.content}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No report content available. Please take a quiz to generate your report.</p>
                <Button
                  variant="outline"
                  className="mt-4 border-accent hover:bg-accent/20"
                  onClick={() => router.push('/quiz-selection')}
                >
                  Take Quiz
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        
      </div>
    </div>
  )
}
