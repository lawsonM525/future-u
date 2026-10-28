import { Schema, model, models } from 'mongoose'

// The URL contains a random bearer token. Only its hash is stored here.
const schema = new Schema({
  tokenHash: { type: String, required: true, unique: true },
  status: { type: String, enum: ['pending', 'processing', 'ready', 'failed'], default: 'pending' },
  quizType: { type: String, required: true },
  answers: { type: Schema.Types.Mixed, required: true },
  content: String,
  summary: String,
  archetypeTag: String,
  userProfile: String,
  checkpoints: { type: [{ year: Number, title: String, description: String, items: [String] }], default: [] },
  userId: { type: String, default: null },
  generationStartedAt: Date,
  attempts: { type: Number, default: 0 },
  timelineError: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
})

export const GuestReport = models.GuestReport || model('GuestReport', schema)
