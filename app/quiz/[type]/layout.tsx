import type { ReactNode } from 'react'
import './theme.css'

export default function QuizTypeLayout({ children }: { children: ReactNode }) {
  return (
    <div className="quizTheme bg-background text-foreground min-h-screen">
      {children}
    </div>
  )
}
