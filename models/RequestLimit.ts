import { Schema, model, models } from 'mongoose'

const schema = new Schema({
  _id: String,
  count: { type: Number, default: 0 },
  expiresAt: { type: Date, required: true, expires: 0 },
})

export const RequestLimit = models.RequestLimit || model('RequestLimit', schema)
