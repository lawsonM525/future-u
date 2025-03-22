'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function PostQuizAuthPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Ensure we have a report to show
  useEffect(() => {
    const reportId = localStorage.getItem('lastReportId')
    if (!reportId) {
      router.push('/quiz-selection')
    }
  }, [router])

  const handleGoogleSignIn = async () => {
    setLoading(true)
    try {
      await signIn('google', { 
        callbackUrl: '/report/strategy'
      })
    } catch (error) {
      setError('Failed to sign in with Google')
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
            To view your results, please create an account or sign in.
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
              <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-background text-gray-500">
                Already have an account?
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full font-semibold"
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            Sign in with Google
          </Button>
        </div>

        {error && (
          <div className="text-center mt-4">
            <p className="text-red-500">{error}</p>
          </div>
        )}
      </div>
    </div>
  )
}
