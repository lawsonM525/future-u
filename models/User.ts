import mongoose, { Document } from 'mongoose'

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  googleId: string;
  email: string;
  name: string;
  avatarUrl?: string;
  createdAt: Date;
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

export const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema)