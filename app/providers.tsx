'use client'

import { SessionProvider } from 'next-auth/react'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { QuizProvider } from '@/lib/quiz-context'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? ""}>
      <SessionProvider>
        <QuizProvider>
          {children}
        </QuizProvider>
      </SessionProvider>
    </GoogleOAuthProvider>
  )
}
