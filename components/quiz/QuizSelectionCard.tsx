'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Clock, ChevronRight, CheckCircle2, TrendingUp } from 'lucide-react'
import type { ReactNode } from 'react'

interface QuizOption {
  title: string
  description: string
  questions: number
  href: string
  estimatedTime: string
  difficulty: 'Easy' | 'Medium' | 'Advanced'
  icon: ReactNode
  features: string[]
  savedProgress?: number
}

interface QuizSelectionCardProps {
  option: QuizOption
  index: number
}

const difficultyColors = {
  Easy: 'text-green-500',
  Medium: 'text-yellow-500',
  Advanced: 'text-red-500'
}

export function QuizSelectionCard({ option, index }: QuizSelectionCardProps) {
  const hasProgress = option.savedProgress && option.savedProgress > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -4 }}
      className="h-full"
    >
      <Card className="h-full hover:shadow-lg transition-shadow duration-300 relative overflow-hidden group">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-transparent" />
        </div>

        <CardHeader className="relative z-10">
          <div className="flex items-start justify-between mb-2">
            <motion.span 
              className="text-4xl"
              whileHover={{ scale: 1.2, rotate: 10 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {option.icon}
            </motion.span>
            <span className={`text-sm font-medium ${difficultyColors[option.difficulty]}`}>
              {option.difficulty}
            </span>
          </div>
          
          <CardTitle className="text-xl">{option.title}</CardTitle>
          <CardDescription className="mt-2">{option.description}</CardDescription>
        </CardHeader>

        <CardContent className="relative z-10 space-y-4">
          {/* Quiz Stats */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1 text-muted-foreground">
              <span className="font-medium">{option.questions}</span> Questions
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-3 w-3" />
              {option.estimatedTime}
            </div>
          </div>

          {/* Features */}
          <div className="space-y-1">
            {option.features.slice(0, 3).map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 + idx * 0.05 }}
                className="flex items-center gap-2 text-xs text-muted-foreground"
              >
                <TrendingUp className="h-3 w-3 text-accent" />
                {feature}
              </motion.div>
            ))}
          </div>

          {/* Saved Progress */}
          {hasProgress && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-2 p-3 bg-accent/10 rounded-lg"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                  In Progress
                </span>
                <span className="font-medium">{Math.round(option.savedProgress!)}%</span>
              </div>
              <Progress value={option.savedProgress} className="h-1.5" />
            </motion.div>
          )}

          {/* CTA Button */}
          <Link href={option.href} className="block">
            <Button 
              variant="yellow" 
              className="w-full font-bold group/btn relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center justify-center w-full">
                {hasProgress ? 'Continue' : 'Start'} Quiz
                <ChevronRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
              </span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-accent/0 via-accent/20 to-accent/0"
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.6 }}
              />
            </Button>
          </Link>
        </CardContent>

        {/* Hover Effect */}
        <motion.div
          className="absolute inset-0 border-2 border-accent/0 rounded-lg pointer-events-none"
          whileHover={{ borderColor: 'hsl(var(--accent) / 0.5)' }}
          transition={{ duration: 0.3 }}
        />
      </Card>
    </motion.div>
  )
}