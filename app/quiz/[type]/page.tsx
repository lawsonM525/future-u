'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuiz } from '@/lib/quiz-context'
import { getQuizConfig, getQuizSections } from '@/lib/quiz-data'
import { useQuizPersistence } from '@/lib/hooks/useQuizPersistence'
import { QuizWelcome } from '@/components/quiz/QuizWelcome'
import { QuizQuestion } from '@/components/quiz/QuizQuestion'
import { QuizProgress } from '@/components/quiz/QuizProgress'
import { QuizSectionTransition } from '@/components/quiz/QuizSectionTransition'
import { Button } from '@/components/ui/button'
import { AlertCircle, Loader2 } from 'lucide-react'

export default function QuizPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const quizType = params.type as string
  
  const {
    currentQuizType,
    currentQuestionIndex,
    answers,
    completedSections,
    startQuiz,
    saveAnswer,
    navigateToQuestion,
    markSectionComplete,
    clearQuizProgress,
    canResumeQuiz
  } = useQuiz()

  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showWelcome, setShowWelcome] = useState(true)
  const [showSectionTransition, setShowSectionTransition] = useState(false)
  const [currentAnswer, setCurrentAnswer] = useState('')

  // Enable quiz persistence for authenticated users
  useQuizPersistence({ enabled: !showWelcome })

  const quizConfig = getQuizConfig(quizType)
  const sections = getQuizSections(quizType)
  const questions = quizConfig?.questions || []
  const currentQuestion = questions[currentQuestionIndex]
  
  // Calculate current section
  const currentSection = sections.find(section => 
    section.questions.some(q => q.id === currentQuestion?.id)
  )
  const currentSectionIndex = sections.findIndex(s => s.id === currentSection?.id)

  // Check if we can resume
  const hasExistingProgress = canResumeQuiz(quizType)
  const savedProgress = hasExistingProgress ? {
    answeredQuestions: Object.keys(answers).length,
    totalQuestions: questions.length,
    lastUpdated: new Date()
  } : undefined

  // Calculate progress
  const overallProgress = (Object.keys(answers).length / questions.length) * 100
  
  // Calculate time remaining (rough estimate)
  const questionsRemaining = questions.length - Object.keys(answers).length
  const avgTimePerQuestion = 0.5 // minutes
  const estimatedTimeRemaining = Math.ceil(questionsRemaining * avgTimePerQuestion)
  const timeRemainingText = estimatedTimeRemaining > 60 
    ? `${Math.floor(estimatedTimeRemaining / 60)}h ${estimatedTimeRemaining % 60}m`
    : `${estimatedTimeRemaining}m`

  useEffect(() => {
    if (!quizConfig) {
      router.push('/quiz-selection')
      return
    }

    // If we have a different quiz in progress, clear it
    if (currentQuizType && currentQuizType !== quizType) {
      clearQuizProgress()
    }
  }, [quizType, quizConfig, router, currentQuizType, clearQuizProgress])

  useEffect(() => {
    // Load the current answer when navigating between questions
    if (currentQuestion) {
      setCurrentAnswer(answers[currentQuestion.id] || '')
    }
  }, [currentQuestion, answers])

  const handleStart = useCallback(() => {
    startQuiz(quizType)
    setShowWelcome(false)
  }, [startQuiz, quizType])

  const handleResume = useCallback(() => {
    // Progress is already loaded in context
    setShowWelcome(false)
  }, [])

  const handleAnswerChange = useCallback((answer: string) => {
    setCurrentAnswer(answer)
  }, [])
  
  const handleSubmit = useCallback(async () => {
    setIsProcessing(true)
    setError(null)
    
    try {
      // Save final answer
      if (currentQuestion) {
        saveAnswer(currentQuestion.id, currentAnswer)
      }

      const finalAnswers = {
        ...answers,
        [currentQuestion.id]: currentAnswer
      }

      if (!session?.user?.id) {
        // Save to temporary storage for unauthenticated users
        const response = await fetch('/api/save-temp-quiz', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ answers: finalAnswers, quizType })
        })

        if (!response.ok) throw new Error('Failed to save quiz data')

        const { tempId } = await response.json()
        clearQuizProgress()
        router.push(`/auth/post-quiz?tempId=${tempId}`)
        return
      }

      // Process quiz for authenticated users
      const response = await fetch('/api/process-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: finalAnswers, quizType })
      })

      if (!response.ok) throw new Error('Failed to process quiz')

      const data = await response.json()
      clearQuizProgress()
      router.push(`/report/${data.reportId}`)
    } catch (err) {
      console.error('Error:', err)
      setError('Failed to process quiz. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }, [currentQuestion, saveAnswer, currentAnswer, answers, session, clearQuizProgress, router, quizType])

  const handleNext = useCallback(async () => {
    if (!currentQuestion) return

    // Save the current answer
    saveAnswer(currentQuestion.id, currentAnswer)

    // Check if this completes a section
    if (sections.length > 0 && currentSection) {
      const sectionQuestions = currentSection.questions
      const lastQuestionInSection = sectionQuestions[sectionQuestions.length - 1]
      
      if (currentQuestion.id === lastQuestionInSection.id) {
        // Mark section as complete
        markSectionComplete(currentSectionIndex)
        
        // Check if there's a next section
        if (currentSectionIndex < sections.length - 1) {
          setShowSectionTransition(true)
          return
        }
      }
    }

    // Check if this is the last question
    if (currentQuestionIndex === questions.length - 1) {
      await handleSubmit()
    } else {
      navigateToQuestion(currentQuestionIndex + 1)
    }
  }, [currentQuestion, currentAnswer, currentQuestionIndex, questions.length, 
      saveAnswer, navigateToQuestion, sections, currentSection, currentSectionIndex, 
      markSectionComplete, handleSubmit])

  const handlePrevious = useCallback(() => {
    if (currentQuestionIndex > 0) {
      navigateToQuestion(currentQuestionIndex - 1)
    }
  }, [currentQuestionIndex, navigateToQuestion])

  const handleContinueFromTransition = useCallback(() => {
    setShowSectionTransition(false)
    navigateToQuestion(currentQuestionIndex + 1)
  }, [currentQuestionIndex, navigateToQuestion])

  

  if (!quizConfig) {
    return null // Will redirect in useEffect
  }

  if (isProcessing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 space-y-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4"
        >
          <Loader2 className="h-12 w-12 animate-spin text-accent mx-auto" />
          <h2 className="text-2xl font-bold">Processing Your Responses</h2>
          <p className="text-muted-foreground max-w-md">
            This may take a minute while we analyze your answers and generate personalized career insights...
          </p>
        </motion.div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4 max-w-md"
        >
          <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
          <h2 className="text-2xl font-bold">Something went wrong</h2>
          <p className="text-muted-foreground">{error}</p>
          <Button
            onClick={() => {
              setError(null)
              setIsProcessing(false)
            }}
            className="bg-accent text-accent-foreground hover:bg-accent/90"
          >
            Try Again
          </Button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col p-4">
      {/* Progress Header */}
      {!showWelcome && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <QuizProgress
            currentProgress={overallProgress}
            sections={sections}
            completedSections={completedSections}
            currentSection={currentSection?.id}
            estimatedTimeRemaining={timeRemainingText}
          />
        </motion.div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {showWelcome ? (
            <motion.div
              key="welcome"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full"
            >
              <QuizWelcome
                quizConfig={quizConfig}
                savedProgress={savedProgress}
                onStart={handleStart}
                onResume={handleResume}
              />
            </motion.div>
          ) : showSectionTransition && sections.length > 0 ? (
            <motion.div
              key="transition"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full"
            >
              <QuizSectionTransition
                completedSection={sections[currentSectionIndex]}
                nextSection={sections[currentSectionIndex + 1] || null}
                onContinue={handleContinueFromTransition}
                questionsAnswered={sections[currentSectionIndex].questions.length}
                sectionIndex={currentSectionIndex}
              />
            </motion.div>
          ) : currentQuestion ? (
            <motion.div
              key={`question-${currentQuestion.id}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full"
            >
              <QuizQuestion
                question={currentQuestion}
                answer={currentAnswer}
                onAnswerChange={handleAnswerChange}
                onNext={handleNext}
                onPrevious={handlePrevious}
                canGoNext={currentAnswer.trim().length > 0 && 
                  currentAnswer.trim().split(/\s+/).length <= (currentQuestion.maxWords || 100)}
                canGoPrevious={currentQuestionIndex > 0}
                isLastQuestion={currentQuestionIndex === questions.length - 1}
                currentIndex={currentQuestionIndex + 1}
                totalQuestions={questions.length}
              />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {/* Footer */}
      {!showWelcome && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-8 text-center"
        >
          <a 
            href="/" 
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Exit Quiz
          </a>
        </motion.div>
      )}
    </div>
  )
}