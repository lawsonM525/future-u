import { connect } from '@/lib/mongodb'
import { NextResponse } from 'next/server'
import { OAuth2Client } from 'google-auth-library'
import { User } from '@/models/User'
import { sign } from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { Mongoose } from 'mongoose'
import type { IUserLean } from '@/models/User'

// Create a single instance of OAuth2Client
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
      } catch (error) {
        dbConnection = null; // Reset connection on timeout
        throw error;
      }
    };

    // Get credential early
    const { credential } = await request.json()

    // Run token verification and DB connection in parallel with proper error handling
    try {
      const [ticket] = await Promise.all([
        client.verifyIdToken({
          idToken: credential,
          audience: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
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
        return NextResponse.json({ 
          error: 'Invalid token' 
        }, { status: 400 })
      }

      // Check if user exists with timeout
      const user = await Promise.race([
        User.findOne({ googleId: payload.sub }).lean() as Promise<IUserLean>,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Database query timeout')), 5000)
        )
      ]);
      
      if (!user) {
        return NextResponse.json({ 
          error: 'No account found with this Google account.' 
        }, { status: 404 })
      }

      // Create JWT token
      const token = sign(
        { 
          userId: user._id.toString(),
          email: user.email,
          googleId: user.googleId 
        },
        process.env.JWT_SECRET as string,
        { expiresIn: '7d' }
      )

      // Set cookie
      cookies().set('auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7 // 7 days
      })

      return NextResponse.json({
        success: true,
        message: 'Logged in successfully'
      })

    } catch (error) {
      console.error('Authentication process error:', error);
      return NextResponse.json({
        error: error instanceof Error ? error.message : 'Authentication failed'
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Request processing error:', error)
    return NextResponse.json({
      error: 'Failed to process request'
    }, { status: 500 })
  }
} 