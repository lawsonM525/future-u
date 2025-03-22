'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn, useSession } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function PostQuizAuthPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const { status } = useSession()

  // Get quiz answers and type from URL params
  const answers = searchParams.get('answers')
  const quizType = searchParams.get('quizType')

  // Ensure we have quiz answers
  useEffect(() => {
    if (!answers || !quizType) {
      router.push('/quiz-selection')
      return
    }

    // If user is already authenticated, process the quiz
    if (status === 'authenticated') {
      handleQuizSubmission()
    }
  }, [router, status, answers, quizType])

  const handleQuizSubmission = async () => {
    if (!answers || !quizType) return

    try {
      const response = await fetch('/api/process-quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answers: JSON.parse(decodeURIComponent(answers)),
          quizType
        })
      })

      if (!response.ok) {
        throw new Error('Failed to process quiz')
      }

      const data = await response.json()
      router.push(`/report/${data.reportId}`)
    } catch (error) {
      console.error('Error processing quiz:', error)
      router.push('/quiz-selection')
    }
  }

  const handleGoogleSignIn = async () => {
    if (!answers || !quizType) return
    
    setLoading(true)
    try {
      // Keep the quiz answers in the URL during authentication
      await signIn('google', { 
        callbackUrl: `/auth/post-quiz?answers=${answers}&quizType=${quizType}`
      })
    } catch {
      setLoading(false)
    }
  }

  // Don't render anything if authenticated (will redirect)
  if (status === 'authenticated') return null

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 animate-fade-in">
      <div className="max-w-md w-full space-y-8 bg-zinc-900 p-8 rounded-lg shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-yellow-400 mb-2">
            Your Career Report is Ready!
          </h2>
          <p className="text-zinc-400 mb-6">
            Sign in to view your personalized career insights and recommendations.
          </p>
        </div>

        <div className="space-y-4">
          <Button
            onClick={handleGoogleSignIn}
            disabled={loading || !answers || !quizType}
            className="w-full bg-yellow-500 text-yellow-950 hover:bg-yellow-400 font-bold py-3"
          >
            {loading ? 'Signing in...' : 'Sign in with Google'}
          </Button>

          <p className="text-center text-sm text-zinc-500">
            By signing in, you agree to our{' '}
            <Link href="/terms" className="text-yellow-500 hover:text-yellow-400">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-yellow-500 hover:text-yellow-400">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
