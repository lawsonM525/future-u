'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useSession, signOut } from 'next-auth/react'

export default function LandingPage() {
  const { data: session } = useSession()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 animate-fade-in">
      <div className="fixed top-4 right-4 flex gap-4">
        {session ? (
          <>
            <span className="self-center font-medium">
              Welcome, {session.user?.name || 'User'}
            </span>
            <Button 
              variant="outline"
              size="lg"
              className="font-semibold"
              onClick={() => signOut()}
            >
              Sign Out
            </Button>
          </>
        ) : (
          <>
            <Link href="/auth/signin">
              <Button 
                variant="outline"
                size="lg"
                className="font-semibold"
              >
                Sign In
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button 
                variant="yellow"
                size="lg"
                className="font-semibold"
              >
                Sign Up
              </Button>
            </Link>
          </>
        )}
      </div>

      <h1 className="text-4xl font-bold mb-6 animate-slide-up">Welcome to Future U</h1>
      <p className="text-xl mb-8 text-center max-w-2xl animate-slide-up">
        Your Future, Mapped Out.
      </p>
      <Link href={session ? "/quiz-selection" : "/auth/signin"}>
        <Button 
          variant="yellow"
          size="lg" 
          className="animate-slide-up font-bold"
        >
          {session ? "Start Your Journey" : "Sign In to Begin"}
        </Button>
      </Link>
    </div>
  )
}
