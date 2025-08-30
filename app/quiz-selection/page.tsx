'use client'

import { motion } from 'framer-motion'
import { useQuiz } from '@/lib/quiz-context'
import { QuizSelectionCard } from '@/components/quiz/QuizSelectionCard'
import Link from 'next/link'
import { ArrowLeft, Sparkles } from 'lucide-react'

const quizOptions = [
  {
    title: 'The Quickie',
    description: 'Short, quick insights. You get a snapshot of your next steps.',
    questions: 10,
    href: '/quiz/quickie',
    estimatedTime: '5-10 min',
    difficulty: 'Easy' as const,
    icon: '⚡',
    features: ['Quick insights', 'Career direction', 'Next steps']
  },
  {
    title: 'I\'ve Got Some Time',
    description: 'Medium-depth career analysis. More detailed insights.',
    questions: 40,
    href: '/quiz/medium',
    estimatedTime: '20-30 min',
    difficulty: 'Medium' as const,
    icon: '🎯',
    features: ['Detailed analysis', 'Personalized roadmap', 'Skill gap analysis']
  },
  {
    title: 'The Deep Dive',
    description: 'Comprehensive career exploration. Thorough goal and situation assessment.',
    questions: 100,
    href: '/quiz/deep-dive',
    estimatedTime: '45-60 min',
    difficulty: 'Advanced' as const,
    icon: '🚀',
    features: ['Complete career analysis', '5-year roadmap', 'Industry transition guide']
  },
]

export default function QuizSelection() {
  const { getQuizCompletion } = useQuiz()

  // Add saved progress to each option
  const optionsWithProgress = quizOptions.map(option => ({
    ...option,
    savedProgress: getQuizCompletion(option.href.split('/').pop() || '')
  }))

  return (
    <div className="min-h-screen flex flex-col p-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto w-full mb-8"
      >
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center">
        <div className="max-w-6xl mx-auto w-full space-y-12">
          {/* Title Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                type: "spring",
                stiffness: 200,
                damping: 20,
                delay: 0.2
              }}
              className="inline-block"
            >
              <Sparkles className="h-12 w-12 text-accent mx-auto" />
            </motion.div>
            
            <h1 className="text-4xl md:text-5xl font-bold">Choose Your Journey</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Select a quiz that matches your available time and desired depth of career exploration
            </p>
          </motion.div>

          {/* Quiz Options Grid */}
          <div className="grid gap-6 md:grid-cols-3">
            {optionsWithProgress.map((option, index) => (
              <QuizSelectionCard 
                key={option.title} 
                option={option} 
                index={index} 
              />
            ))}
          </div>

          {/* Bottom Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center space-y-4"
          >
            <p className="text-sm text-muted-foreground">
              Not sure which to choose? Start with &ldquo;The Quickie&rdquo; for a taste of what FutureU can offer
            </p>
            
            <Link 
              href="/login" 
              className="inline-flex items-center gap-2 text-accent hover:text-accent/80 transition-colors font-medium"
            >
              Already taken a quiz? Sign in to view your report
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  )
}