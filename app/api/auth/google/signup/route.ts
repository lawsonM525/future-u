import { connect } from '@/lib/mongodb'
import { NextResponse } from 'next/server'
import { OAuth2Client } from 'google-auth-library'
import { User } from '@/models/User'
import { sign } from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { Mongoose, Types } from 'mongoose'

// Define the type for lean document
interface UserLeanDoc {
  _id: Types.ObjectId;
  googleId: string;
  email: string;
  name: string;
  avatarUrl?: string;
  createdAt: Date;
}

const client = new OAuth2Client(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID)

// Update the type to match connect()'s return type
let dbConnection: Promise<Mongoose> | null = null;

export async function POST(request: Request) {
  try {
    // Start DB connection with timeout
    const connectWithTimeout = async () => {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Database connection timeout')), 10000);
      });

      if (!dbConnection) {
        dbConnection = connect();
      }

      try {
        await Promise.race([dbConnection, timeoutPromise]);
        return dbConnection;
      } catch (error) {
        dbConnection = null; // Reset connection on error
        throw error;
      }
    };

    const { credential } = await request.json()

    if (!credential) {
      return NextResponse.json(
        { error: 'Google credential is required' },
        { status: 400 }
      )
    }

    // Verify the Google token and connect to DB in parallel
    const [ticket] = await Promise.all([
      client.verifyIdToken({
        idToken: credential,
        audience: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      }).catch(error => {
        console.error('Token verification error:', error);
        throw new Error('Failed to verify Google token');
      }),
      connectWithTimeout().catch(error => {
        console.error('Database connection error:', error);
        throw new Error('Database connection failed');
      })
    ]);

    const payload = ticket.getPayload()
    
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token payload' },
        { status: 400 }
      )
    }

    try {
      // Check if user exists with timeout
      const userDoc = await Promise.race([
        User.findOne({ googleId: payload.sub }).lean(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Database query timeout')), 5000)
        )
      ]) as UserLeanDoc | null;

      if (userDoc) {
        return NextResponse.json({ 
          error: 'Account already exists. Please sign in instead.' 
        }, { status: 409 })
      }

      // Create new user
      const newUser = await User.create({
        googleId: payload.sub,
        email: payload.email,
        name: payload.name,
        avatarUrl: payload.picture
      })

      // Transform new user to lean format
      const user = {
        _id: newUser._id.toString(),
        googleId: newUser.googleId,
        email: newUser.email,
        name: newUser.name,
        avatarUrl: newUser.avatarUrl,
        createdAt: newUser.createdAt
      }

      // Generate JWT
      const token = sign(
        { userId: user._id },
        process.env.JWT_SECRET || '',
        { expiresIn: '7d' }
      )

      // Set cookie
      cookies().set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 // 7 days
      })

      return NextResponse.json({ user })
    } catch (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Authentication error:', error)
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 401 }
    )
  }
}