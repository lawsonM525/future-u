import { NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { connect } from '@/lib/mongodb'
import { User } from '@/models/User'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Connect to MongoDB
    await connect()

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await hash(password, 12)

    // Create new user
    const user = await User.create({
      email,
      password: hashedPassword
    })

    return NextResponse.json(
      { message: 'User created successfully', userId: user._id },
      { status: 201 }
    )
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}
