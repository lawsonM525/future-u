'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useSession, signOut } from 'next-auth/react'

export default function LandingPage() {
  const { data: session } = useSession()

  return (
    <div className="min-h-screen flex flex-col relative p-4 animate-fade-in">
      <div className="fixed top-4 right-4 flex gap-4">
        {session && (
          <Button 
            variant="outline"
            size="lg"
            className="font-semibold"
            onClick={() => signOut()}
          >
            Sign Out
          </Button>
        )}
      </div>

      {/* Main content - centered */}
      <div className="flex-1 flex flex-col items-center justify-center">
        {session ? (
          <>
            <h1 className="text-4xl font-bold mb-6 animate-slide-up">
              Welcome back, {session.user?.name?.split(' ')[0] || 'User'}
            </h1>
            <p className="text-xl mb-8 text-center max-w-2xl animate-slide-up">
              Ready to recommit to your dream?
            </p>
            <div className="flex flex-col gap-4 items-center animate-slide-up">
              <Link href="/dashboard">
                <Button 
                  variant="yellow"
                  size="lg" 
                  className="font-bold"
                >
                  View Your Dashboard
                </Button>
              </Link>
              <Link href="/quiz-selection">
                <Button 
                  variant="outline"
                  size="lg" 
                  className="font-bold"
                >
                  Take Quiz Again
                </Button>
              </Link>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-4xl font-bold mb-6 animate-slide-up font-rubik-mono-one">Welcome to Future U</h1>
            <p className="text-xl mb-8 text-center max-w-2xl animate-slide-up">
              Your Future, Mapped Out.
            </p>
            <Link href="/quiz-selection">
              <Button 
                variant="yellow"
                size="lg" 
                className="animate-slide-up font-bold rounded-full"
              >
                Start Your Journey
              </Button>
            </Link>
          </>
        )}
      </div>

      {/* Footer content - at bottom */}
      {!session && (
        <div className="w-full flex justify-center pb-8 mt-auto animate-slide-up">
          <Link href="/login" className="text-yellow-500 hover:text-yellow-400 transition-colors font-medium">
            Already taken the quiz? Sign in.
          </Link>
        </div>
      )}
    </div>
  )
}
