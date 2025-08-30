'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'


interface QuizProgress {
  quizType: string
  currentQuestionIndex: number
  answers: Record<number, string>
  startedAt: Date
  lastUpdatedAt: Date
  completedSections: number[]
}

interface QuizContextType {
  // Current quiz state
  currentQuizType: string | null
  currentQuestionIndex: number
  answers: Record<number, string>
  
  // Progress tracking
  quizProgress: QuizProgress | null
  completedSections: number[]
  
  // Actions
  startQuiz: (quizType: string) => void
  saveAnswer: (questionId: number, answer: string) => void
  navigateToQuestion: (index: number) => void
  markSectionComplete: (sectionId: number) => void
  clearQuizProgress: () => void
  loadQuizProgress: (quizType: string) => QuizProgress | null
  
  // Persistence helpers
  canResumeQuiz: (quizType: string) => boolean
  getQuizCompletion: (quizType: string) => number
}

const QuizContext = createContext<QuizContextType | undefined>(undefined)

const QUIZ_STORAGE_KEY = 'futureU_quizProgress'

export function QuizProvider({ children }: { children: React.ReactNode }) {
  const [currentQuizType, setCurrentQuizType] = useState<string | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [quizProgress, setQuizProgress] = useState<QuizProgress | null>(null)
  const [completedSections, setCompletedSections] = useState<number[]>([])

  // Load quiz progress from localStorage on mount
  useEffect(() => {
    // Check if we're in the browser
    if (typeof window === 'undefined') return

    const loadStoredProgress = () => {
      try {
        const stored = localStorage.getItem(QUIZ_STORAGE_KEY)
        if (stored) {
          const progress = JSON.parse(stored) as QuizProgress
          // Only restore if quiz was updated within last 24 hours
          const lastUpdate = new Date(progress.lastUpdatedAt)
          const hoursSinceUpdate = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60)
          
          if (hoursSinceUpdate < 24) {
            setQuizProgress(progress)
            setCurrentQuizType(progress.quizType)
            setCurrentQuestionIndex(progress.currentQuestionIndex)
            setAnswers(progress.answers)
            setCompletedSections(progress.completedSections || [])
          }
        }
      } catch (error) {
        console.error('Error loading quiz progress:', error)
      }
    }

    loadStoredProgress()
  }, [])

  // Save progress to localStorage whenever it changes
  useEffect(() => {
    // Check if we're in the browser
    if (typeof window === 'undefined') return
    
    if (quizProgress) {
      try {
        localStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(quizProgress))
      } catch (error) {
        console.error('Error saving quiz progress:', error)
      }
    }
  }, [quizProgress])

  const startQuiz = useCallback((quizType: string) => {
    const now = new Date()
    const newProgress: QuizProgress = {
      quizType,
      currentQuestionIndex: 0,
      answers: {},
      startedAt: now,
      lastUpdatedAt: now,
      completedSections: []
    }
    
    setCurrentQuizType(quizType)
    setCurrentQuestionIndex(0)
    setAnswers({})
    setCompletedSections([])
    setQuizProgress(newProgress)
  }, [])

  const saveAnswer = useCallback((questionId: number, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }))

    setQuizProgress(prev => {
      if (!prev) return null
      return {
        ...prev,
        answers: {
          ...prev.answers,
          [questionId]: answer
        },
        lastUpdatedAt: new Date()
      }
    })
  }, [])

  const navigateToQuestion = useCallback((index: number) => {
    setCurrentQuestionIndex(index)
    setQuizProgress(prev => {
      if (!prev) return null
      return {
        ...prev,
        currentQuestionIndex: index,
        lastUpdatedAt: new Date()
      }
    })
  }, [])

  const markSectionComplete = useCallback((sectionId: number) => {
    setCompletedSections(prev => {
      if (prev.includes(sectionId)) return prev
      return [...prev, sectionId]
    })

    setQuizProgress(prev => {
      if (!prev) return null
      const newCompleted = prev.completedSections.includes(sectionId) 
        ? prev.completedSections 
        : [...prev.completedSections, sectionId]
      
      return {
        ...prev,
        completedSections: newCompleted,
        lastUpdatedAt: new Date()
      }
    })
  }, [])

  const clearQuizProgress = useCallback(() => {
    setCurrentQuizType(null)
    setCurrentQuestionIndex(0)
    setAnswers({})
    setCompletedSections([])
    setQuizProgress(null)
    
    // Check if we're in the browser
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(QUIZ_STORAGE_KEY)
      } catch (error) {
        console.error('Error clearing quiz progress:', error)
      }
    }
  }, [])

  const loadQuizProgress = useCallback((quizType: string): QuizProgress | null => {
    // Check if we're in the browser
    if (typeof window === 'undefined') return null
    
    try {
      const stored = localStorage.getItem(QUIZ_STORAGE_KEY)
      if (stored) {
        const progress = JSON.parse(stored) as QuizProgress
        if (progress.quizType === quizType) {
          return progress
        }
      }
    } catch (error) {
      console.error('Error loading quiz progress:', error)
    }
    return null
  }, [])

  const canResumeQuiz = useCallback((quizType: string): boolean => {
    const progress = loadQuizProgress(quizType)
    if (!progress) return false
    
    // Check if quiz was updated within last 24 hours
    const lastUpdate = new Date(progress.lastUpdatedAt)
    const hoursSinceUpdate = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60)
    
    return hoursSinceUpdate < 24 && Object.keys(progress.answers).length > 0
  }, [loadQuizProgress])

  const getQuizCompletion = useCallback((quizType: string): number => {
    const progress = loadQuizProgress(quizType)
    if (!progress) return 0
    
    // This would need to be adjusted based on actual quiz lengths
    const quizLengths: Record<string, number> = {
      'test': 3,
      'quickie': 10,
      'medium': 40,
      'deep-dive': 100
    }
    
    const totalQuestions = quizLengths[quizType] || 0
    const answeredQuestions = Object.keys(progress.answers).length
    
    return totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0
  }, [loadQuizProgress])

  const value: QuizContextType = {
    currentQuizType,
    currentQuestionIndex,
    answers,
    quizProgress,
    completedSections,
    startQuiz,
    saveAnswer,
    navigateToQuestion,
    markSectionComplete,
    clearQuizProgress,
    loadQuizProgress,
    canResumeQuiz,
    getQuizCompletion
  }

  return (
    <QuizContext.Provider value={value}>
      {children}
    </QuizContext.Provider>
  )
}

export function useQuiz() {
  const context = useContext(QuizContext)
  if (context === undefined) {
    throw new Error('useQuiz must be used within a QuizProvider')
  }
  return context
}