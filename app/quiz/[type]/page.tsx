'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'

const quizData = {
  test: { 
    questions: 3, 
    name: 'Test Quiz',
    prompts: [
      "What is your current job title?",
      "What industry do you want towork in?",
      "What's your dream job?"
    ]
  },
  quickie: { 
    questions: 10, 
    name: 'The Quickie',
    prompts: [
      "What are your career goals for the next 5 years?",
      "What skills do you currently possess?",
      "What industry interests you the most?",
      "Describe your ideal work environment.",
      "What's your educational background?",
      "What are your salary expectations?",
      "What skills would you like to develop?",
      "What's your preferred work style?",
      "What challenges are you facing in your career?",
      "What motivates you professionally?"
    ]
  },
  medium: { 
    questions: 40, 
    name: 'I\'ve Got Some Time',
    prompts: Array(40).fill("What are your career goals?")
  },
  'deep-dive': { 
    questions: 100, 
    name: 'The Deep Dive',
    prompts: Array(100).fill("What are your career goals?")
  }
}

export default function QuizPage() {
  const params = useParams()
  const quizType = params.type as keyof typeof quizData
  const { questions, prompts } = quizData[quizType]
  const router = useRouter()

  const [currentQuestion, setCurrentQuestion] = useState(1)
  const [answer, setAnswer] = useState('')
  const [isAnimating, setIsAnimating] = useState(false)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isNavigating, setIsNavigating] = useState(false)

  const handleNext = useCallback(async () => {
    // Store the current answer
    setAnswers(prev => ({
      ...prev,
      [currentQuestion]: answer
    }))

    if (currentQuestion < questions) {
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentQuestion(currentQuestion + 1)
        setAnswer('')
        setIsAnimating(false)
      }, 300)
    } else {
      setIsProcessing(true)
      setError(null)
      
      try {
        const response = await fetch('/api/process-quiz', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            quizType,
            answers: {
              ...answers,
              [currentQuestion]: answer
            }
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          if (response.status === 504) {
            throw new Error('The request took too long to process. This usually happens when our AI is under heavy load. Please try again.')
          }
          throw new Error(errorData.error || 'Failed to process quiz')
        }

        const data = await response.json()
        if (!data.reportId) {
          throw new Error('No report ID received')
        }

        setIsNavigating(true)
        await router.push(`/report/${quizType}?id=${data.reportId}`)
      } catch (error) {
        console.error('Error processing quiz:', error)
        setError(error instanceof Error ? error.message : 'Failed to process quiz')
        setIsProcessing(false)
        setIsNavigating(false)
      }
    }
  }, [currentQuestion, questions, quizType, router, answer, answers])

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

  if (isProcessing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 space-y-4">
        {!error ? (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
            <h2 className="text-2xl font-bold text-center">
              {isNavigating ? 'Taking you to your results...' : 'Processing Your Responses'}
            </h2>
            <p className="text-center text-muted-foreground">
              {isNavigating 
                ? 'Almost there!'
                : 'This may take a minute while we analyze your answers and generate personalized career insights...'}
            </p>
          </>
        ) : (
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-red-500">
              {error.includes('too long to process') ? 'Request Timeout' : 'Something Went Wrong'}
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">{error}</p>
            <Button 
              onClick={() => {
                setError(null)
                setIsProcessing(false)
              }}
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              Try Again
            </Button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 animate-fade-in">
      <h1 className="text-3xl font-bold mb-6 animate-slide-up">
        Question {currentQuestion}: {prompts[currentQuestion - 1]}
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
