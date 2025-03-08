'use client'

import { Button } from '@/components/ui/button'
import { GoogleLogin, CredentialResponse } from '@react-oauth/google'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function SignupPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    try {
      setError(null)
      const response = await fetch('/api/auth/google/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          credential: credentialResponse.credential,
        }),
      })

      if (response.ok) {
        // Redirect to dashboard on successful signup
        router.push('/dashboard')
      } else {
        const errorData = await response.json()
        console.error('Signup failed:', errorData)
        setError(errorData.error || 'Failed to sign up. Please try again.')
      }
    } catch (error) {
      console.error('Signup error:', error instanceof Error ? error.message : 'Unknown error')
      setError('An unexpected error occurred. Please try again.')
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg dark:bg-gray-800">
        <h1 className="text-2xl font-bold text-center">Create Your Future U Account</h1>
        
        <div className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-100 dark:bg-red-900/20 rounded-md text-center">
              {error}
            </div>
          )}
          
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleSuccess}
              onError={() => {
                setError('Signup Failed. Please try again.')
              }}
              useOneTap
              theme="filled_blue"
              size="large"
              text="signup_with"
              shape="rectangular"
            />
          </div>
          
          <div className="text-center space-y-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <Link 
                href="/login" 
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-semibold"
              >
                Sign in here!
              </Link>
            </div>
            
            <Link href="/">
              <Button variant="outline" className="mt-2">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 