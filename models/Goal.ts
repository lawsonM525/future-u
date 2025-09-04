import mongoose, { Schema, Document, models, model } from 'mongoose'

export type GoalStatus = 'pending' | 'in_progress' | 'completed'

export interface GoalDocument extends Document {
  userId: string
  title: string
  description?: string
  status: GoalStatus
  checkpointYear?: number
  dueDate?: Date | null
  createdAt: Date
  completedAt?: Date | null
}

const GoalSchema = new Schema<GoalDocument>({
  userId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'in_progress', 'completed'], default: 'pending', index: true },
  checkpointYear: { type: Number },
  dueDate: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
  completedAt: { type: Date, default: null }
})

GoalSchema.index({ userId: 1, createdAt: -1 })

export const Goal = (models.Goal as mongoose.Model<GoalDocument>) || model<GoalDocument>('Goal', GoalSchema)
