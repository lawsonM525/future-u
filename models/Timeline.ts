import mongoose from 'mongoose'

export interface TimelineCheckpoint {
  year: number
  title: string
  description: string
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
      required: true
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
})

export const Timeline = mongoose.models.Timeline || mongoose.model('Timeline', TimelineSchema)
