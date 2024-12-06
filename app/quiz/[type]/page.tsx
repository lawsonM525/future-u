'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'

const quizData = {
  quickie: { questions: 10, name: 'The Quickie' },
  medium: { questions: 40, name: 'I\'ve Got Some Time' },
  'deep-dive': { questions: 100, name: 'The Deep Dive' },
}

export default function QuizPage() {
  const params = useParams()
  const quizType = params.type as keyof typeof quizData
  const { questions } = quizData[quizType]
  const router = useRouter()

  const [currentQuestion, setCurrentQuestion] = useState(1)
  const [answer, setAnswer] = useState('')
  const [isAnimating, setIsAnimating] = useState(false)

  const handleNext = useCallback(() => {
    if (currentQuestion < questions) {
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentQuestion(currentQuestion + 1)
        setAnswer('')
        setIsAnimating(false)
      }, 300)
    } else {
      // Handle quiz completion
      router.push(`/report/${quizType}`)
    }
  }, [currentQuestion, questions, quizType, router])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && answer.trim().length > 0 && answer.trim().split(/\s+/).length <= 100) {
      e.preventDefault()
      handleNext()
    }
  }, [answer, handleNext])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 animate-fade-in">
      <h1 className="text-3xl font-bold mb-6 animate-slide-up">
        Question {currentQuestion}: What are your career goals for the next 5 years?
      </h1>
      <Progress 
        value={(currentQuestion / questions) * 100} 
        className="w-full max-w-md mb-4 animate-slide-up bg-gray-200"
        style={{
          '--tw-progress-fill-color': 'hsl(var(--accent))',
        } as React.CSSProperties}
      />
      <p className="mb-4 animate-slide-up">Question {currentQuestion} of {questions}</p>
      <Textarea
        placeholder="Your answer (1-100 words)"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        className={`w-full max-w-md mb-4 transition-opacity duration-300 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}
      />
      <Button 
        onClick={handleNext} 
        disabled={answer.trim().length === 0 || answer.trim().split(/\s+/).length > 100}
        className="bg-accent text-accent-foreground hover:bg-accent/90 animate-slide-up font-bold"
      >
        {currentQuestion === questions ? 'Finish' : 'Next'}
      </Button>
    </div>
  )
}
