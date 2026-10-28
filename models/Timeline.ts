import mongoose from 'mongoose'

export interface TimelineCheckpoint {
  year: number
  title: string
  description?: string
  items?: string[]
}

const TimelineSchema = new mongoose.Schema({
  reportId: { type: String, index: true },
  userId: {
    type: String,
    required: true,
    index: true
  },
  checkpoints: [{
    year: {
      type: Number,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: false
    },
    items: [{
      type: String,
      required: false
    }]
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
})

TimelineSchema.index({ userId: 1, reportId: 1 }, { unique: true, partialFilterExpression: { reportId: { $type: 'string' } } })

export const Timeline = mongoose.models.Timeline || mongoose.model('Timeline', TimelineSchema)
