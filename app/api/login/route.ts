import { NextResponse } from 'next/server'
import { verifyGoogleToken } from '@/lib/auth'
import { sign } from 'jsonwebtoken'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const { credential } = await request.json()

    if (!credential) {
      return NextResponse.json(
        { error: 'Google credential is required' },
        { status: 400 }
      )
    }

    // Verify Google token and get/create user
    const user = await verifyGoogleToken(credential)

    // Create JWT token
    const token = sign(
      { 
        userId: user._id, // MongoDB _id
        email: user.email,
        googleId: user.googleId 
      },
      process.env.JWT_SECRET as string, // Using existing JWT_SECRET
      { expiresIn: '7d' }
    )

    // Set cookie
    cookies().set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    })

    return NextResponse.json(
      { message: 'Logged in successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Failed to login' },
      { status: 500 }
    )
  }
}
