import { connect } from '@/lib/mongodb'
import { NextResponse } from 'next/server'
import { OAuth2Client } from 'google-auth-library'
import { User } from '@/models/User'
import { sign } from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { Mongoose } from 'mongoose'
import type { IUserLean } from '@/models/User'

const client = new OAuth2Client(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID)

// Add caching for database connection with correct type
let dbConnection: Promise<Mongoose> | null = null;

export async function POST(request: Request) {
  try {
    // Start DB connection early
    if (!dbConnection) {
      dbConnection = connect()
    }

    const { credential } = await request.json()

    // Verify token in parallel with DB connection
    const [ticket] = await Promise.all([
      client.verifyIdToken({
        idToken: credential,
        audience: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
      }),
      dbConnection
    ])

    const payload = ticket.getPayload()
    
    if (!payload) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid token' 
      }, { status: 400 })
    }

    // Connect to MongoDB
    await connect()

    // Check if user already exists
    const existingUser = await User.findOne({ googleId: payload.sub })
    
    if (existingUser) {
      return NextResponse.json({ 
        error: 'Account already exists. Please sign in instead.' 
      }, { status: 409 })
    }

    // Create new user and convert to lean
    const user = (await User.create({
      googleId: payload.sub,
      email: payload.email,
      name: payload.name,
      avatarUrl: payload.picture
    })).toObject() as IUserLean

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
      message: 'Account created successfully'
    })

  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to create account'
    }, { status: 500 })
  }
} 