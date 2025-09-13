import mongoose, { Schema, Document, models, model } from 'mongoose'

export interface QuestDocument extends Document {
  userId: string
  goalId?: string
  goalTitle: string
  goalYear?: number | null
  title: string
  quantity: number
  progress: number
  explanation?: string
  createdAt: Date
  completedAt?: Date | null
}

const QuestSchema = new Schema<QuestDocument>({
  userId: { type: String, required: true, index: true },
  goalId: { type: String },
  goalTitle: { type: String, required: true },
  goalYear: { type: Number },
  title: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  progress: { type: Number, default: 0, min: 0 },
  explanation: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  completedAt: { type: Date, default: null }
})

QuestSchema.index({ userId: 1, createdAt: -1 })

export const Quest = (models.Quest as mongoose.Model<QuestDocument>) || model<QuestDocument>('Quest', QuestSchema)
