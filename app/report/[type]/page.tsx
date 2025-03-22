'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface Career {
  id: string
  score: number
  metadata: {
    text: string
  }
}

interface Report {
  content: string
  careers?: Career[]
}

export default function ReportPage({ params }: { params: { type: string } }) {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [report, setReport] = useState<Report | null>(null)

  useEffect(() => {
    const sendPendingReport = async () => {
      const pendingReportContent = sessionStorage.getItem('pendingReportContent')
      const reportId = localStorage.getItem('lastReportId')
      
      if (pendingReportContent && reportId && session?.user?.email && session?.user?.name) {
        try {
          const response = await fetch('/api/send-report', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ reportId }),
          })

          if (!response.ok) {
            console.error('Failed to send report email')
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
    // Check authentication
    if (status === 'unauthenticated') {
      router.push('/login?redirect=' + encodeURIComponent('/report/' + params.type))
      return
    }

    const reportId = localStorage.getItem('lastReportId')
    if (!reportId) {
      setError('No report found. Please take the quiz first.')
      setLoading(false)
      return
    }

    async function fetchReport() {
      try {
        const response = await fetch(`/api/get-report?id=${reportId}`)
        if (!response.ok) {
          throw new Error('Failed to load report')
        }
        const data = await response.json()
        console.log('Raw API response:', data) // Debug log
        
        // Ensure data has the correct structure
        if (!data.content) {
          throw new Error('Invalid report format: missing content')
        }
        
        // Convert careers to array if it's not already
        const careers = Array.isArray(data.careers) ? data.careers : []
        
        setReport({
          content: data.content,
          careers: careers
        })
      } catch (error) {
        console.error('Error fetching report:', error)
        setError(error instanceof Error ? error.message : 'Failed to load report')
      } finally {
        setLoading(false)
      }
    }

    if (status === 'authenticated') {
      fetchReport()
    }
  }, [params.type, router, status])

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen p-8 max-w-4xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen p-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Your Career Strategy</h1>
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <Link href="/quiz-selection" className="mt-4 inline-block">
            <Button variant="yellow">Take the Quiz</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Your Career Strategy</h1>
      
      <div className="prose dark:prose-invert max-w-none">
        {session?.user && (
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Prepared for {session.user.name}
          </div>
        )}
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]}
          components={{
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            h1: ({children, ...props}) => <h1 className="text-2xl font-bold mt-8 mb-4" {...props}>{children}</h1>,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            h2: ({children, ...props}) => <h2 className="text-xl font-bold mt-6 mb-3" {...props}>{children}</h2>,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            h3: ({children, ...props}) => <h3 className="text-lg font-bold mt-4 mb-2" {...props}>{children}</h3>,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            p: ({children, ...props}) => <p className="mb-4 leading-relaxed" {...props}>{children}</p>,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            ul: ({children, ...props}) => <ul className="list-disc pl-6 mb-4" {...props}>{children}</ul>,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            ol: ({children, ...props}) => <ol className="list-decimal pl-6 mb-4" {...props}>{children}</ol>,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            li: ({children, ...props}) => <li className="mb-2" {...props}>{children}</li>,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            blockquote: ({children, ...props}) => (
              <blockquote className="border-l-4 border-yellow-500 pl-4 italic my-4" {...props}>{children}</blockquote>
            ),
          }}
        >
          {report?.content || ''}
        </ReactMarkdown>

        {report?.careers && report.careers.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">Similar Career Paths</h2>
            <ul className="space-y-4">
              {report.careers.map((career: Career) => (
                <li key={career.id} className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                  <p className="text-sm">{career.metadata.text}</p>
                  <div className="mt-2 text-xs text-gray-500">
                    Match Score: {Math.round(career.score * 100)}%
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="mt-8 flex gap-4">
        <Link href="/">
          <Button variant="outline">Back to Home</Button>
        </Link>
        <Link href="/quiz-selection">
          <Button variant="yellow">Take Quiz Again</Button>
        </Link>
        <Button 
          variant="outline" 
          className="ml-auto"
          onClick={async () => {
            try {
              const reportId = localStorage.getItem('lastReportId')
              if (!reportId) {
                throw new Error('No report found')
              }
              
              const response = await fetch('/api/send-report', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ reportId }),
              })
              
              if (!response.ok) {
                throw new Error('Failed to send report')
              }
              
              alert('Report sent to your email!')
            } catch (error) {
              console.error('Error sending report:', error)
              alert('Failed to send report. Please try again.')
            }
          }}
        >
          Email Report
        </Button>
      </div>
    </div>
  )
}
