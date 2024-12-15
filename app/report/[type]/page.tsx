"use client"

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function ReportPage() {
  const searchParams = useSearchParams()
  const reportId = searchParams.get('id')
  const [report, setReport] = useState<string | null>(null)
  const [careers, setCareers] = useState<string | null>(null)
  const [showCareers, setShowCareers] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchReport = async () => {
      try {
        if (!reportId) {
          throw new Error('No report ID provided')
        }

        const response = await fetch(`/api/get-report?id=${reportId}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch report')
        }

        setReport(data.report)
        setCareers(data.careers)
      } catch (error) {
        console.error('Error fetching report:', error)
        setError(error instanceof Error ? error.message : 'Failed to load report')
      } finally {
        setLoading(false)
      }
    }

    fetchReport()
  }, [reportId])

  if (loading) {
    return <div className="min-h-screen p-4">Loading your personalized report...</div>
  }

  if (error) {
    return (
      <div className="min-h-screen p-4">
        <h1 className="text-3xl font-bold mb-6">Your Career Report</h1>
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4">
      <h1 className="text-3xl font-bold mb-6">Your Career Report</h1>
      
      <div className="space-y-4">
        {showCareers ? (
          <div className="prose max-w-none bg-muted p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Relevant Career Data</h2>
            {careers?.split('\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        ) : (
          <div className="prose max-w-none">
            {report?.split('\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        )}
        
        <div className="flex gap-4 items-center mt-8">
          <Button 
            variant="yellow" 
            className="font-bold"
            onClick={() => window.print()}
          >
            Download PDF Report
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowCareers(!showCareers)}
          >
            {showCareers ? 'Show Full Report' : 'Show Relevant Data Selected'}
          </Button>
        </div>
      </div>
    </div>
  )
}
