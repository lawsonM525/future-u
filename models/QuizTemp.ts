import mongoose, { Schema, Document } from 'mongoose'

export interface QuizTempDocument extends Document {
  answers: Record<number, string>
  quizType: string
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
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600 // Automatically delete after 1 hour
  }
})

export const QuizTemp = mongoose.models.QuizTemp || mongoose.model<QuizTempDocument>('QuizTemp', QuizTempSchema)
