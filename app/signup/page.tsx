'use client'

import { Suspense } from 'react'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn, useSession } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

function SignupContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const redirect = searchParams.get('redirect') || '/'
  const isPostQuiz = redirect.includes('/report/strategy')

  useEffect(() => {
    if (session) {
      router.push(redirect)
    }
  }, [session, router, redirect])

  const handleGoogleSignup = async () => {
    setLoading(true)
    try {
      await signIn('google', { 
        callbackUrl: redirect
      })
    } catch {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">
            {isPostQuiz ? 'Create Your Account' : 'Sign Up for Future U'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            {isPostQuiz 
              ? 'Your career strategy is ready! Create an account to view your personalized results and save them for future reference.'
              : 'Join Future U to discover your career path and get personalized guidance.'}
          </p>
        </div>

        <Button 
          variant="yellow" 
          className="w-full font-semibold text-lg py-6"
          onClick={handleGoogleSignup}
          disabled={loading}
        >
          {isPostQuiz ? 'Create Account with Google' : 'Sign Up with Google'}
        </Button>

        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          Already have an account?{' '}
          <Link
            href={`/login${redirect !== '/' ? `?redirect=${redirect}` : ''}`}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-semibold"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
          </div>
          <div className="h-12 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    }>
      <SignupContent />
    </Suspense>
  )
}