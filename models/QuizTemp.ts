import mongoose, { Schema, Document } from 'mongoose'

export interface QuizTempDocument extends Document {
  answers: Record<number, string>
  quizType: string
  userId?: string
  processed: boolean
  reportId?: string
  processingStartedAt?: Date
  createdAt: Date
}

const QuizTempSchema = new Schema({
  answers: {
    type: Schema.Types.Mixed,
    required: true
  },
  quizType: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    default: null
  },
  reportId: String,
  processingStartedAt: Date,
  processed: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600 // Automatically delete after 1 hour
  }
})

export const QuizTemp = mongoose.models.QuizTemp || mongoose.model<QuizTempDocument>('QuizTemp', QuizTempSchema)
