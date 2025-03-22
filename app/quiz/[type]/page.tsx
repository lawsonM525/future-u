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
    prompts: [
      // Current Situation (20 questions)
      "What's your current job or role in life?",
      "How would you describe yourself in one sentence today?",
      "What skills do you use most often in your work?",
      "What's one skill you feel confident in?",
      "How satisfied are you with your current career path? (1-10)",
      "What's a challenge you're facing in your work right now?",
      "Where do you live, and how do you feel about it?",
      "How do you feel about your current work-life balance?",
      "What's one thing you'd like to change about your daily life?",
      "How do you feel about your current financial situation?",
      "What's one financial goal you're working toward?",
      "Who are the people you spend the most time with?",
      "How do you feel about your current relationships?",
      "What's one value you prioritize the most in your life right now?",
      "What's one fear you feel is holding you back today?",
      "How do you usually spend your free time?",
      "What's one professional goal you're working toward?",
      "How do you feel about your current industry or field?",
      "What's the biggest financial challenge you're facing right now?",
      "How connected do you feel to your community?",

      // Future Aspirations (20 questions)
      "What's your dream job?",
      "What's the biggest dream you've ever had?",
      "What's one skill you want to build for your career?",
      "What impact do you want to have on the world?",
      "If you could create your own job, what would it look like?",
      "What's a problem in the world you'd love to solve?",
      "What industry excites you the most right now?",
      "What's one accomplishment that would make you feel fulfilled?",
      "Where do you want to live in 10 years?",
      "What's your ideal daily routine?",
      "What kind of work-life balance would make you happiest?",
      "What's one value you'll never compromise on?",
      "What kind of person do you want to be in 10 years?",
      "What's one thing about yourself you're most proud of?",
      "What's an activity you can do for hours without getting bored?",
      "What's one topic you'd love to learn more about?",
      "If you could turn a hobby into a career, what would it be?",
      "What unique contribution do you want to make?",
      "What does financial success mean to you?",
      "Who's living a life you admire, and why?"
    ]
  },
  'deep-dive': { 
    questions: 100, 
    name: 'The Deep Dive',
    prompts: [
      // Current Identity & Values (20 questions)
      "What's your current job or role in life?",
      "How would you describe yourself in one sentence today?",
      "What's one value you prioritize most in your life right now?",
      "What's one thing about yourself you feel confident in?",
      "What's one fear you feel is holding you back today?",
      "How do you usually spend your free time?",
      "What's one word to describe your current mindset?",
      "What's one belief about yourself that you're questioning?",
      "What's something you've recently accomplished that you're proud of?",
      "What's one habit you wish you could change?",
      "What motivates you the most right now?",
      "What's one word that describes the life you want?",
      "What's your biggest strength?",
      "What's your biggest weakness?",
      "What makes you unique?",
      "What's one thing you'd never compromise on?",
      "What's your personal definition of success?",
      "What's one thing you wish others knew about you?",
      "What's one life experience that shaped who you are?",
      "What's one thing you're currently struggling with?",

      // Current Career & Skills (20 questions)
      "What skills do you use most often in your work?",
      "What's one skill you feel particularly confident in?",
      "What's one skill you'd like to improve?",
      "How satisfied are you with your current career path? (1-10)",
      "What's one thing you've learned on the job recently?",
      "What's a challenge you're facing in your work right now?",
      "What's one professional goal you're working toward?",
      "How do you feel about your current industry or field?",
      "What's one thing you wish was different about your current job?",
      "What's your favorite part of your current work?",
      "What's your least favorite part of your current work?",
      "How do you handle work-related stress?",
      "What's your preferred working style?",
      "How do you like to learn new things?",
      "What's one professional relationship you'd like to improve?",
      "What's one work achievement you're proud of?",
      "What's one work-related decision you regret?",
      "How do you measure success in your current role?",
      "What's one thing you'd change about your work environment?",
      "What's one professional opportunity you wish you had?",

      // Current Lifestyle & Finances (20 questions)
      "Where do you live, and how do you feel about it?",
      "What does your daily routine usually look like?",
      "How do you spend your weekends?",
      "What's your current work-life balance like?",
      "How do you feel about your current financial situation?",
      "What's one financial goal you're working toward?",
      "What's the biggest financial challenge you're facing?",
      "How do you usually make decisions about money?",
      "What's one purchase you've made recently that you regret?",
      "What's one thing you wish you could afford right now?",
      "How do you feel about your ability to manage money?",
      "What's your relationship with saving and spending?",
      "How do you feel about your current living space?",
      "What's one thing you'd change about your lifestyle?",
      "How do you typically handle stress?",
      "What's your relationship with health and wellness?",
      "How do you spend your free time?",
      "What's one habit you'd like to develop?",
      "What's one thing you'd like to simplify in your life?",
      "How do you recharge when you're feeling drained?",

      // Future Dreams & Aspirations (20 questions)
      "What's your biggest dream?",
      "What's your dream job?",
      "If success were guaranteed, what would you do?",
      "What impact do you want to have on the world?",
      "Where do you see yourself in 10 years?",
      "What's one skill you want to master?",
      "What's a problem in the world you'd love to solve?",
      "What industry excites you the most?",
      "What's one accomplishment that would make you feel fulfilled?",
      "What's your ideal daily routine?",
      "What kind of work-life balance do you want?",
      "What's one value you'll never compromise on?",
      "What kind of person do you want to become?",
      "What's one thing you'd regret not trying?",
      "What's something you've always wanted to learn?",
      "If you could create your perfect job, what would it be?",
      "What's one way you'd like to make a difference?",
      "What does your ideal future look like?",
      "What's one bold move you'd like to make?",
      "What's one legacy you'd like to leave behind?",

      // Action Steps & Implementation (20 questions)
      "What's one small step you could take today toward your goals?",
      "What's holding you back from pursuing your dreams?",
      "What resources do you need to achieve your goals?",
      "Who could help you achieve your goals?",
      "What skills do you need to develop?",
      "What's one habit you need to build?",
      "What's one thing you need to let go of?",
      "What's your timeline for achieving your goals?",
      "What's your backup plan if things don't work out?",
      "How will you measure your progress?",
      "What's one obstacle you need to overcome?",
      "What support system do you need to build?",
      "What's one risk you need to take?",
      "What's one boundary you need to set?",
      "What's one commitment you need to make to yourself?",
      "What's one thing you need to learn more about?",
      "What's one connection you need to make?",
      "What's one change you need to implement?",
      "What's one decision you need to make?",
      "What's your first step forward from here?"
    ]
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
        // Store the report ID and content in localStorage
        localStorage.setItem('lastReportId', data.reportId)
        localStorage.setItem('lastReportContent', data.reportContent)
        
        // Redirect to auth page after quiz
        router.push('/auth/post-quiz')
      } catch (err: unknown) {
        console.error('Error processing quiz:', err)
        setError(err instanceof Error ? err.message : 'Failed to process quiz')
        setIsProcessing(false)
        setIsNavigating(false)
      }
    }
  }, [currentQuestion, questions, quizType, router, answer, answers])

  const handlePrevious = useCallback(() => {
    if (currentQuestion > 1) {
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentQuestion(prev => prev - 1)
        setAnswer(answers[currentQuestion - 1] || '')
        setIsAnimating(false)
      }, 300) // Adjust the delay as needed
    }
  }, [currentQuestion, answers])

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
              {typeof error === 'string' && error.includes('too long to process') ? 'Request Timeout' : 'Something Went Wrong'}
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
      <div className="flex space-x-4">
        <Button 
          onClick={handlePrevious} 
          disabled={currentQuestion === 1 || isAnimating}
          className="bg-accent text-accent-foreground hover:bg-accent/90 animate-slide-up font-bold"
        >
          Previous
        </Button>
        <Button 
          onClick={handleNext} 
          disabled={answer.trim().length === 0 || answer.trim().split(/\s+/).length > 100}
          className="bg-accent text-accent-foreground hover:bg-accent/90 animate-slide-up font-bold"
        >
          {currentQuestion === questions ? 'Finish' : 'Next'}
        </Button>
      </div>
      <a href="/" className="text-gray-500 mt-4">Back to Home</a>
    </div>
  )
}
