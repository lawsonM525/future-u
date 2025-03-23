'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn, useSession } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

function PostQuizContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const { status } = useSession()

  // Get quiz answers and type from URL params
  const answers = searchParams.get('answers')
  const quizType = searchParams.get('quizType')

  const handleQuizSubmission = async () => {
    if (!answers || !quizType) return

    setIsProcessing(true)
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
      router.push(`/report/latest`)
    } catch (error) {
      console.error('Error processing quiz:', error)
      setError('Failed to process quiz')
      setIsProcessing(false)
    }
  }

  // Process quiz when authenticated and has answers
  useEffect(() => {
    if (!answers || !quizType) {
      router.push('/quiz-selection')
      return
    }

    // If user is already authenticated, process the quiz
    if (status === 'authenticated') {
      handleQuizSubmission()
    }
  }, [answers, quizType, status, router])

  const handleGoogleSignIn = async () => {
    if (!answers || !quizType) return
    
    setLoading(true)
    try {
      await signIn('google', { 
        callbackUrl: window.location.href,
        redirect: true,
      })
    } catch {
      setLoading(false)
    }
  }

  // Don't render anything if authenticated (will redirect)
  if (status === 'authenticated') return null

  if (isProcessing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
        <h2 className="text-2xl font-bold text-center">
          Processing Your Career Assessment
        </h2>
        <p className="text-center text-zinc-400 max-w-md">
          Please wait while we analyze your responses and generate your personalized career strategy...
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 space-y-8">
      <div className="text-center space-y-2">
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
      </div>
    </div>
  )
}

// Loading state while the page is being client-side rendered
function LoadingState() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
    </div>
  )
}

export default function PostQuizPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <PostQuizContent />
    </Suspense>
  )
}
