import { Schema, model, models, Document } from 'mongoose'

export interface IReport extends Document {
  data: string;
  careers: string;
  createdAt: Date;
}

const reportSchema = new Schema<IReport>({
  data: { type: String, required: true },
  careers: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
})

export const Report = models.Report || model<IReport>('Report', reportSchema)
