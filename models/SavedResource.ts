import mongoose, { Schema, Document, models, model } from 'mongoose'

export interface SavedResourceDocument extends Document {
  userId: string
  title: string
  url: string
  source?: string
  tags?: string[]
  addedAt: Date
}

const SavedResourceSchema = new Schema<SavedResourceDocument>({
  userId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  url: { type: String, required: true },
  source: { type: String },
  tags: { type: [String], default: [] },
  addedAt: { type: Date, default: Date.now }
})

SavedResourceSchema.index({ userId: 1, addedAt: -1 })

export const SavedResource = (models.SavedResource as mongoose.Model<SavedResourceDocument>) || model<SavedResourceDocument>('SavedResource', SavedResourceSchema)
