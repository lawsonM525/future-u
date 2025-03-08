import { NextResponse } from 'next/server'
import { connect } from '@/lib/mongodb'

export async function GET() {
  try {
    await connect()
    return NextResponse.json({ message: 'Database connected successfully' })
  } catch (error) {
    console.error('Database connection error:', error)
    return NextResponse.json(
      { error: 'Failed to connect to database' },
      { status: 500 }
    )
  }
} 