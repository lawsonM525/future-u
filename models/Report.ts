import { Schema, model, models, Document } from 'mongoose'

export interface IReport extends Document {
  content: string;
  careers: Array<{
    id: string;
    score: number;
    metadata: any;
  }>;
  userId: string;
  createdAt: Date;
}

const reportSchema = new Schema<IReport>({
  content: { type: String, required: true },
  careers: [{
    id: { type: String, required: true },
    score: { type: Number, required: true },
    metadata: { type: Schema.Types.Mixed, required: true }
  }],
  userId: { type: String, required: true, index: true },
  createdAt: { type: Date, default: Date.now }
})

export const Report = models.Report || model<IReport>('Report', reportSchema)
