'use client'

import { motion } from 'framer-motion'
import { Progress } from '@/components/ui/progress'
import { CheckCircle2, Circle, Clock, Trophy } from 'lucide-react'
import { QuizSection } from '@/lib/quiz-data'

interface QuizProgressProps {
  currentProgress: number
  sections?: QuizSection[]
  completedSections: number[]
  currentSection?: string
  estimatedTimeRemaining?: string
}

export function QuizProgress({
  currentProgress,
  sections,
  completedSections,
  currentSection,
  estimatedTimeRemaining
}: QuizProgressProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-4xl mx-auto space-y-4"
    >
      {/* Main Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-medium text-foreground">Overall Progress</h3>
          <div className="flex items-center gap-2">
            {estimatedTimeRemaining && (
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                ~{estimatedTimeRemaining} remaining
              </span>
            )}
            <span className="text-sm font-bold text-accent">{Math.round(currentProgress)}%</span>
          </div>
        </div>
        
        <div className="relative">
          <Progress 
            value={currentProgress} 
            className="h-3 bg-gray-200"
          />
          
          {/* Milestone Markers */}
          {[25, 50, 75].map((milestone) => (
            <motion.div
              key={milestone}
              initial={{ scale: 0 }}
              animate={{ 
                scale: currentProgress >= milestone ? 1 : 0 
              }}
              transition={{ 
                type: "spring",
                stiffness: 500,
                damping: 30,
                delay: currentProgress >= milestone ? 0.2 : 0
              }}
              className="absolute top-1/2 -translate-y-1/2"
              style={{ left: `${milestone}%` }}
            >
              <div className="relative -translate-x-1/2">
                <Trophy className="h-4 w-4 text-accent" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Section Progress */}
      {sections && sections.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          <h3 className="text-sm font-medium text-foreground">Sections</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {sections.map((section, index) => {
              const isCompleted = completedSections.includes(index)
              const isCurrent = section.id === currentSection
              
              return (
                <motion.div
                  key={section.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className={`
                    relative p-3 rounded-lg border transition-all
                    ${isCurrent ? 'border-accent bg-accent/10' : 'border-border'}
                    ${isCompleted ? 'bg-muted/50' : ''}
                  `}
                >
                  <div className="flex items-start justify-between mb-1">
                    <span className="text-xl">{section.icon || '📝'}</span>
                    {isCompleted ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <h4 className="text-xs font-medium line-clamp-1">{section.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {section.questions.length} questions
                  </p>
                  
                  {isCurrent && (
                    <motion.div
                      className="absolute inset-0 rounded-lg border-2 border-accent"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  )}
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* Motivational Message */}
      {currentProgress > 0 && currentProgress < 100 && (
        <motion.p
          key={Math.floor(currentProgress / 25)}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="text-sm text-center text-muted-foreground italic"
        >
          {currentProgress < 25 && "Great start! Keep going..."}
          {currentProgress >= 25 && currentProgress < 50 && "You're doing amazing! Halfway there..."}
          {currentProgress >= 50 && currentProgress < 75 && "Fantastic progress! The finish line is in sight..."}
          {currentProgress >= 75 && currentProgress < 100 && "Almost there! Just a few more questions..."}
        </motion.p>
      )}
    </motion.div>
  )
}