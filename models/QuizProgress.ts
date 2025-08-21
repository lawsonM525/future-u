import mongoose, { Schema, Document } from 'mongoose'

export interface QuizProgressDocument extends Document {
  userId: string
  quizType: string
  currentQuestionIndex: number
  answers: Record<number, string>
  completedSections: number[]
  startedAt: Date
  lastUpdatedAt: Date
  completedAt?: Date
  status: 'in_progress' | 'completed' | 'abandoned'
  metadata?: {
    timeSpent?: number // in seconds
    pauseCount?: number
    deviceType?: string
    userAgent?: string
  }
}

const QuizProgressSchema = new Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  quizType: {
    type: String,
    required: true,
    enum: ['test', 'quickie', 'medium', 'deep-dive']
  },
  currentQuestionIndex: {
    type: Number,
    default: 0
  },
  answers: {
    type: Schema.Types.Mixed,
    default: {}
  },
  completedSections: {
    type: [Number],
    default: []
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  lastUpdatedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['in_progress', 'completed', 'abandoned'],
    default: 'in_progress'
  },
  metadata: {
    timeSpent: Number,
    pauseCount: Number,
    deviceType: String,
    userAgent: String
  }
})

// Compound index for finding user's quiz progress
QuizProgressSchema.index({ userId: 1, quizType: 1 })
QuizProgressSchema.index({ userId: 1, status: 1 })
QuizProgressSchema.index({ lastUpdatedAt: 1 })

// Update lastUpdatedAt on save
QuizProgressSchema.pre('save', function(next) {
  this.lastUpdatedAt = new Date()
  next()
})

export const QuizProgress = mongoose.models.QuizProgress || mongoose.model<QuizProgressDocument>('QuizProgress', QuizProgressSchema)