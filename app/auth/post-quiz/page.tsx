'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function PostQuizAuthPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  // Ensure we have a report to show
  useEffect(() => {
    const reportId = localStorage.getItem('lastReportId')
    const reportContent = localStorage.getItem('lastReportContent')
    if (!reportId || !reportContent) {
      router.push('/quiz-selection')
    }
  }, [router])

  const handleGoogleSignIn = async () => {
    setLoading(true)
    try {
      // Store the report content in sessionStorage so we can access it after auth
      const reportContent = localStorage.getItem('lastReportContent')
      if (reportContent) {
        sessionStorage.setItem('pendingReportContent', reportContent)
      }
      
      await signIn('google', { 
        callbackUrl: '/report/strategy'
      })
    } catch {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Your Career Strategy is Ready!</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            We&apos;ve analyzed your responses and prepared a personalized career strategy for you. 
            To view your results and receive them by email, please create an account or sign in.
          </p>
        </div>

        <div className="space-y-4">
          <Link href="/signup?redirect=/report/strategy" className="w-full">
            <Button 
              variant="yellow" 
              className="w-full font-semibold text-lg py-6"
              disabled={loading}
            >
              Create Account to View Results
            </Button>
          </Link>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={handleGoogleSignIn}
            className="w-full py-6 text-lg font-semibold"
            disabled={loading}
          >
            Sign in with Google
          </Button>
        </div>
      </div>
    </div>
  )
}
