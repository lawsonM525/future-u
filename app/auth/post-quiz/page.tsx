'use client'

import { useState, useEffect, useCallback, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn, useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

// Component that uses useSearchParams must be wrapped in Suspense
function PostQuizContent() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { status } = useSession()
  
  const submissionStarted = useRef(false)
  const tempId = searchParams.get('tempId')

  const handleQuizSubmission = useCallback(async () => {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 210_000)
    try {
      setIsProcessing(true)
      setError(null)

      // Process the temporary quiz using the new endpoint
      const response = await fetch('/api/process-temp-quiz', {
        signal: controller.signal,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tempId
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process quiz');
      }

      router.push('/dashboard')
    } catch (error) {
      console.error('Error processing quiz:', error);
      setError(error instanceof Error && error.name !== 'AbortError' ? error.message : 'This is taking too long. Your answers are saved. Please retry.');
      submissionStarted.current = false;
      setIsProcessing(false);
    } finally {
      clearTimeout(timeout)
    }
  }, [tempId, router])

  // Process quiz when authenticated and has answers
  useEffect(() => {
    if (!tempId) {
      router.push('/quiz-selection')
      return
    }

    // If user is already authenticated, process the quiz
    if (status === 'authenticated' && !submissionStarted.current) {
      submissionStarted.current = true
      void handleQuizSubmission()
    }
  }, [status, tempId, handleQuizSubmission, router])

  const handleSignIn = () => {
    setLoading(true)
    // Use the current URL as the callback URL to preserve the tempId parameter
    signIn('google', { callbackUrl: window.location.href })
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full p-6 bg-card rounded-lg shadow-lg space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Almost There!</h1>
          <p className="text-muted-foreground">
            Sign in to see your personalized career strategy
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
            <Button
              onClick={() => void handleQuizSubmission()}
              className="mt-3 w-full bg-accent text-white hover:bg-accent/90"
            >
              Try again
            </Button>
          </div>
        )}

        {isProcessing && !error ? (
          <div className="flex flex-col items-center justify-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
            <p>Processing your results...</p>
          </div>
        ) : !error && (
          <Button
            onClick={handleSignIn}
            disabled={loading}
            className="w-full bg-accent text-white hover:bg-accent/90"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign in with Google"
            )}
          </Button>
        )}
      </div>
    </div>
  )
}

// Loading state while the page is being client-side rendered
function LoadingState() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-accent" />
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
