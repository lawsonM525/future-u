import { NextResponse } from 'next/server'
import { auth } from '@/app/utils/authOptions'
import { connect } from '@/lib/mongodb'
import { User } from '@/models/User'
import type { IUser } from '@/models/User'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    await connect()
    const user = await User.findOne({ email: session.user.email }).lean<IUser>()
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const tier = user.subscriptionTier ?? 'free'
    const interval = typeof user.subscriptionInterval === 'undefined' ? null : user.subscriptionInterval
    const currentPeriodEnd = user.subscriptionCurrentPeriodEnd ?? null

    return NextResponse.json({
      subscriptionTier: tier,
      subscriptionInterval: interval,
      subscriptionCurrentPeriodEnd: currentPeriodEnd ? new Date(currentPeriodEnd).toISOString() : null,
      prices: {
        monthly: 14.99,
        annual: 149.0,
        currency: 'USD',
      },
    })
  } catch (err) {
    console.error('GET /api/subscription error:', err)
    return NextResponse.json({ error: 'Failed to load subscription' }, { status: 500 })
  }
}

export async function PATCH() {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    return NextResponse.json({
      error: 'Direct subscription changes are disabled. Use Stripe Payment Links to upgrade and the Customer Portal to cancel or manage your plan.'
    }, { status: 405 })
  } catch (err) {
    console.error('PATCH /api/subscription error:', err)
    return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 })
  }
}
