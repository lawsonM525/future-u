import { NextResponse } from 'next/server'
import { connect } from '@/lib/mongodb'

export async function GET() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables')
    }
    await connect()
    return NextResponse.json({ message: 'Database connected successfully', uri: process.env.MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@') })
  } catch (error) {
    console.error('Database connection error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to connect to database',
        details: error instanceof Error ? error.message : 'Unknown error',
        mongodbUri: process.env.MONGODB_URI ? 'Defined' : 'Not defined'
      },
      { status: 500 }
    )
  }
}