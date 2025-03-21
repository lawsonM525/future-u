import mongoose, { Document } from 'mongoose'

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  googleId: string;
  email: string;
  name: string;
  avatarUrl?: string;
  createdAt: Date;
}

// Add a lean version of the interface without Document methods
export type IUserLean = Omit<IUser, keyof Document> & {
  _id: string; // Convert ObjectId to string for lean queries
}

const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
  },
  name: {
    type: String,
    required: [true, 'Name is required']
  },
  avatarUrl: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
})

// If the model is already compiled, use it. Otherwise compile it
export const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema)