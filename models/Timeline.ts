import mongoose from 'mongoose'

export interface TimelineCheckpoint {
  year: number
  title: string
  description?: string
  items?: string[]
}

const TimelineSchema = new mongoose.Schema({
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

export const Timeline = mongoose.models.Timeline || mongoose.model('Timeline', TimelineSchema)
