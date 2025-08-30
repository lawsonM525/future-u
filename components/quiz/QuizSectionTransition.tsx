'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { CheckCircle2, ArrowRight } from 'lucide-react'
import { QuizSection } from '@/lib/quiz-data'

interface QuizSectionTransitionProps {
  completedSection: QuizSection
  nextSection: QuizSection | null
  onContinue: () => void
  questionsAnswered: number
  sectionIndex: number
}

export function QuizSectionTransition({
  completedSection,
  nextSection,
  onContinue,
  questionsAnswered,
  sectionIndex
}: QuizSectionTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="w-full max-w-2xl mx-auto text-center space-y-8 py-12"
    >
      {/* Success Animation */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ 
          type: "spring",
          stiffness: 200,
          damping: 20,
          delay: 0.2
        }}
        className="relative"
      >
        <motion.div
          className="absolute inset-0 bg-green-500/20 rounded-full blur-xl"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <CheckCircle2 className="h-24 w-24 text-green-500 mx-auto relative z-10" />
      </motion.div>

      {/* Section Complete Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-3"
      >
        <h2 className="text-3xl font-bold text-foreground">
          {completedSection.title} Complete!
        </h2>
        <p className="text-muted-foreground">
          You&apos;ve answered {questionsAnswered} questions in this section. Great job!
        </p>
      </motion.div>

      {/* Achievement Badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6 }}
        className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-full"
      >
        <span className="text-2xl">{completedSection.icon || '🎯'}</span>
        <span className="font-medium text-accent">Section {sectionIndex + 1} Complete</span>
      </motion.div>

      {/* Next Section Preview */}
      {nextSection && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="space-y-4 pt-8 border-t"
        >
          <h3 className="text-lg font-semibold text-foreground">
            Up Next: {nextSection.title}
          </h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            {nextSection.description}
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <span className="text-2xl">{nextSection.icon || '📝'}</span>
            <span>{nextSection.questions.length} questions</span>
          </div>
        </motion.div>
      )}

      {/* Continue Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        <Button
          onClick={onContinue}
          size="lg"
          className="bg-accent text-accent-foreground hover:bg-accent/90 group"
        >
          {nextSection ? 'Continue to Next Section' : 'Finish Quiz'}
          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Button>
      </motion.div>

      {/* Motivational Quote */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="text-sm text-muted-foreground italic max-w-md mx-auto"
      >
        &ldquo;Every step forward is a step toward achieving something bigger and better than your current situation.&rdquo;
      </motion.p>
    </motion.div>
  )
}