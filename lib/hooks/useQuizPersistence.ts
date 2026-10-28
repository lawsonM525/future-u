import { useEffect, useCallback, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useQuiz } from '@/lib/quiz-context'

interface UseQuizPersistenceOptions {
  autoSaveInterval?: number // in milliseconds
  enabled?: boolean
}

export function useQuizPersistence(options: UseQuizPersistenceOptions = {}) {
  const { autoSaveInterval = 30000, enabled = true } = options // Default 30 seconds
  const { data: session } = useSession()
  const { 
    currentQuizType, 
    currentQuestionIndex, 
    answers, 
    completedSections,
    quizProgress 
  } = useQuiz()
  
  const lastSavedRef = useRef<string>('')
  const saveTimeoutRef = useRef<NodeJS.Timeout>()

  // Create a debounced save function
  const saveProgress = useCallback(async () => {
    if (!enabled || !session?.user?.id || !currentQuizType) return

    const currentState = JSON.stringify({
      currentQuestionIndex,
      answers,
      completedSections
    })

    // Skip if nothing changed
    if (currentState === lastSavedRef.current) return

    try {
      const response = await fetch('/api/quiz-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizType: currentQuizType,
          currentQuestionIndex,
          answers,
          completedSections
        })
      })

      if (response.ok) {
        lastSavedRef.current = currentState
        console.log('Quiz progress auto-saved')
      }
    } catch (error) {
      console.error('Failed to save quiz progress:', error)
    }
  }, [enabled, session, currentQuizType, currentQuestionIndex, answers, completedSections])

  // Load progress on mount for authenticated users
  useEffect(() => {
    if (!enabled || !session?.user?.id || !currentQuizType) return

    const loadProgress = async () => {
      try {
        const response = await fetch(`/api/quiz-progress?quizType=${currentQuizType}`)
        if (response.ok) {
          const data = await response.json()
          if (data.progress) {
            // Progress will be loaded by the context
            console.log('Quiz progress loaded from server')
          }
        }
      } catch (error) {
        console.error('Failed to load quiz progress:', error)
      }
    }

    loadProgress()
  }, [enabled, session, currentQuizType])

  // Auto-save on changes
  useEffect(() => {
    if (!enabled || !quizProgress) return

    // Save immediately when answers change
    const debounceTimer = setTimeout(saveProgress, 2000)

    // Also set up periodic auto-save
    if (saveTimeoutRef.current) {
      clearInterval(saveTimeoutRef.current)
    }

    saveTimeoutRef.current = setInterval(saveProgress, autoSaveInterval)

    return () => {
      clearTimeout(debounceTimer)
      if (saveTimeoutRef.current) {
        clearInterval(saveTimeoutRef.current)
      }
    }
  }, [enabled, quizProgress, saveProgress, autoSaveInterval])

  // Save on page unload
  useEffect(() => {
    if (!enabled) return

    const handleBeforeUnload = () => {
      saveProgress()
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [enabled, saveProgress])

  return {
    saveProgress,
    isAuthenticated: !!session?.user?.id
  }
}