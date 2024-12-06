"use client"

import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'

const reportData = {
  free: { title: 'Free Report', price: 'Free' },
  quickie: { title: 'Quickie Report', price: '$20' },
  medium: { title: 'Medium Report', price: '$30' },
  'deep-dive': { title: 'Deep Dive Report', price: '$50' },
}

export default function ReportPage() {
  const params = useParams()
  const reportType = params.type as keyof typeof reportData
  const { title, price } = reportData[reportType]

  return (
    <div className="min-h-screen p-4">
      <h1 className="text-3xl font-bold mb-6">{title}</h1>
      <p className="mb-4">Price: {price}</p>
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Summary of Quiz Answers</h2>
        <p>Your quiz answers summary will appear here.</p>
        
        <h2 className="text-2xl font-semibold">Influencer Recommendations</h2>
        <p>Personalized influencer recommendations will appear here.</p>
        
        <h2 className="text-2xl font-semibold">Career Advice</h2>
        <p>Tailored career advice based on your responses will appear here.</p>
        
        {reportType !== 'free' && (
          <>
            <h2 className="text-2xl font-semibold">7-Step Action Plan</h2>
            <p>Your personalized 7-step action plan will appear here.</p>
            
            <Button variant="yellow" className="font-bold">Download PDF Report</Button>
          </>
        )}
      </div>
    </div>
  )
}
