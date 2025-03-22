'use client'

import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'

export default function ReportPage({ params }: { params: { type: string } }) {
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
              // No report found, redirect to quiz
              router.push('/quiz/' + params.type)
              return
            }
            throw new Error('Failed to fetch report')
          }
          
          const data = await res.json()
          if (data.report) {
            setReport(data.report)
          } else {
            router.push('/quiz/' + params.type)
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
  }, [status, session, params.type, router])

  const downloadPDF = async () => {
    try {
      if (!report?.content) return;

      const res = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          content: report.content,
          userName: session?.user?.name,
          date: report.createdAt
        })
      })

      if (!res.ok) {
        throw new Error('Failed to generate PDF')
      }

      // Get the PDF blob
      const blob = await res.blob()
      
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'career-strategy.pdf'
      document.body.appendChild(a)
      a.click()
      
      // Cleanup
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error downloading PDF:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground p-8">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-8">
            <div className="h-8 bg-card rounded-lg animate-pulse" />
            <div className="h-64 bg-card rounded-lg animate-pulse" />
            <div className="h-32 bg-card rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background text-foreground p-8">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h1 className="text-2xl font-bold text-accent">{error}</h1>
          <Button asChild variant="outline" className="border-accent hover:bg-accent/20">
            <Link href="/quiz/personality">Take the Quiz</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-4xl mx-auto space-y-8">
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
            {report?.content && (
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
                  {report.content.replace(/\*\*([^*]+)\*\*\s*\n\1/g, '**$1**')}
                </ReactMarkdown>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center mt-8">
          <Button
            variant="outline"
            className="border-accent hover:bg-accent/20"
            onClick={() => router.push('/')}
          >
            Back to Home
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push('/quiz/' + params.type)}
          >
            Retake Quiz
          </Button>
          <Button
            variant="yellow"
            onClick={() => downloadPDF()}
          >
            Download PDF
          </Button>
        </div>
      </div>
    </div>
  )
}
