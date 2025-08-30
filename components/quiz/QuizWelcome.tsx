'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Clock, RotateCcw, PlayCircle, Award } from 'lucide-react'
import { QuizConfig } from '@/lib/quiz-data'

interface QuizWelcomeProps {
  quizConfig: QuizConfig
  savedProgress?: {
    answeredQuestions: number
    totalQuestions: number
    lastUpdated: Date
  }
  onStart: () => void
  onResume: () => void
}

export function QuizWelcome({
  quizConfig,
  savedProgress,
  onStart,
  onResume
}: QuizWelcomeProps) {
  const hasProgress = savedProgress && savedProgress.answeredQuestions > 0
  const progressPercentage = hasProgress 
    ? (savedProgress.answeredQuestions / savedProgress.totalQuestions) * 100 
    : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-3xl mx-auto space-y-8"
    >
      {/* Quiz Header */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="text-center space-y-4"
      >
        <motion.div
          initial={{ rotate: -180, scale: 0 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ 
            type: "spring",
            stiffness: 200,
            damping: 20,
            delay: 0.2
          }}
          className="inline-block"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-accent/20 rounded-full blur-xl" />
            <Award className="h-16 w-16 text-accent relative" />
          </div>
        </motion.div>
        
        <h1 className="text-4xl font-bold text-foreground">{quizConfig.name}</h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          {quizConfig.description}
        </p>
      </motion.div>

      {/* Quiz Details */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <div className="bg-muted/50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-accent">{quizConfig.totalQuestions}</div>
          <div className="text-sm text-muted-foreground">Questions</div>
        </div>
        <div className="bg-muted/50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-accent flex items-center justify-center gap-1">
            <Clock className="h-5 w-5" />
            {quizConfig.estimatedTime}
          </div>
          <div className="text-sm text-muted-foreground">Estimated Time</div>
        </div>
        <div className="bg-muted/50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-accent">
            {quizConfig.sections ? quizConfig.sections.length : 1}
          </div>
          <div className="text-sm text-muted-foreground">Sections</div>
        </div>
      </motion.div>

      {/* Features */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-3"
      >
        <h3 className="font-semibold text-foreground">What you&apos;ll get:</h3>
        <ul className="space-y-2">
          {quizConfig.features.map((feature, index) => (
            <motion.li
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="flex items-center gap-2 text-muted-foreground"
            >
              <div className="h-2 w-2 bg-accent rounded-full" />
              {feature}
            </motion.li>
          ))}
        </ul>
      </motion.div>

      {/* Saved Progress */}
      {hasProgress && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-accent/10 border border-accent/20 rounded-lg p-6 space-y-4"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h3 className="font-semibold text-foreground">Welcome back!</h3>
              <p className="text-sm text-muted-foreground">
                You have a quiz in progress from {new Date(savedProgress.lastUpdated).toLocaleDateString()}
              </p>
            </div>
            <RotateCcw className="h-5 w-5 text-accent" />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span className="font-semibold">{savedProgress.answeredQuestions} / {savedProgress.totalQuestions} questions</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </motion.div>
      )}

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="flex flex-col sm:flex-row gap-4 justify-center"
      >
        {hasProgress ? (
          <>
            <Button
              onClick={onResume}
              size="lg"
              className="bg-accent text-accent-foreground hover:bg-accent/90 group"
            >
              <PlayCircle className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
              Resume Quiz
            </Button>
            <Button
              onClick={onStart}
              size="lg"
              variant="outline"
            >
              Start Over
            </Button>
          </>
        ) : (
          <Button
            onClick={onStart}
            size="lg"
            className="bg-accent text-accent-foreground hover:bg-accent/90 group px-8"
          >
            <PlayCircle className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
            Start Quiz
          </Button>
        )}
      </motion.div>

      {/* Tips */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-center text-sm text-muted-foreground space-y-2"
      >
        <p>💡 Your progress is automatically saved as you go</p>
        <p>⏰ You can pause and resume anytime within 24 hours</p>
      </motion.div>
    </motion.div>
  )
}