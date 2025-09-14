import { Schema, model, models, Document } from 'mongoose'

export interface IReport extends Document {
  content: string;
  summary?: string;
  archetypeTag?: string;
  careers: Array<{
    id: string;
    score: number;
    metadata: any;
  }>;
  userId: string;
  createdAt: Date;
  strategyResources?: {
    strategies: Array<{
      title: string;
      details: Array<{
        text: string;
        results: Array<{
          title: string;
          url: string;
          snippet?: string;
          author?: string | null;
          publishedDate?: string | null;
          favicon?: string;
          image?: string;
        }>;
      }>;
    }>;
    generatedAt: Date;
  };
}

const ResourceResultSchema = new Schema({
  title: { type: String, required: true },
  url: { type: String, required: true },
  snippet: { type: String, required: false },
  author: { type: String, required: false },
  publishedDate: { type: String, required: false },
  favicon: { type: String, required: false },
  image: { type: String, required: false },
}, { _id: false })

const ResourceDetailSchema = new Schema({
  text: { type: String, required: true },
  results: { type: [ResourceResultSchema], default: [] },
}, { _id: false })

const ResourceGroupSchema = new Schema({
  title: { type: String, required: true },
  details: { type: [ResourceDetailSchema], default: [] },
}, { _id: false })

const reportSchema = new Schema<IReport>({
  content: { type: String, required: true },
  summary: { type: String, required: false },
  archetypeTag: { type: String, required: false },
  careers: [{
    id: { type: String, required: true },
    score: { type: Number, required: true },
    metadata: { type: Schema.Types.Mixed, required: true }
  }],
  userId: { type: String, required: true, index: true },
  createdAt: { type: Date, default: Date.now },
  strategyResources: {
    strategies: { type: [ResourceGroupSchema], default: undefined },
    generatedAt: { type: Date, required: false },
  }
})

export const Report = models.Report || model<IReport>('Report', reportSchema)
