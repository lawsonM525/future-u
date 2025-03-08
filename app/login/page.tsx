'use client'

import { Button } from '@/components/ui/button'
import { GoogleLogin, CredentialResponse } from '@react-oauth/google'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState<React.ReactNode | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    try {
      setError(null)
      setIsLoading(true)
      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          credential: credentialResponse.credential,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        router.push('/dashboard')
      } else {
        if (response.status === 404) {
          setError(
            <div>
              No account found. Would you like to{' '}
              <Link 
                href="/signup" 
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline font-semibold"
              >
                create an account
              </Link>
              ?
            </div>
          )
        } else {
          setError(data.error || 'Failed to sign in. Please try again.')
        }
      }
    } catch (error) {
      console.error('Login error:', error instanceof Error ? error.message : 'Unknown error')
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg dark:bg-gray-800">
        <h1 className="text-2xl font-bold text-center">Sign In to Future U</h1>
        
        <div className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-100 dark:bg-red-900/20 rounded-md text-center">
              {error}
            </div>
          )}
          
          <div className="flex flex-col items-center gap-4">
            {isLoading ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-6 h-6 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Verifying your account...
                </p>
              </div>
            ) : (
              <GoogleLogin
                onSuccess={handleSuccess}
                onError={() => {
                  setError('Login Failed. Please try again.')
                }}
                useOneTap
                theme="outline"
                size="large"
                text="signin_with"
                shape="rectangular"
                type="standard"
              />
            )}
          </div>
          
          <div className="text-center space-y-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              New to Future U?{' '}
              <Link 
                href="/signup" 
                className="text-yellow-500 hover:text-yellow-600 dark:text-yellow-400 dark:hover:text-yellow-300 font-semibold"
              >
                Sign up here!
              </Link>
            </div>
            
            <Link href="/">
              <Button variant="yellow" className="mt-2">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 