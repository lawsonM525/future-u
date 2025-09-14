import { NextResponse } from 'next/server'
import { auth } from '@/app/utils/authOptions'
import { connect } from '@/lib/mongodb'
import { User } from '@/models/User'
import type { IUser } from '@/models/User'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

function addMonths(date: Date, months: number) {
  const d = new Date(date)
  d.setMonth(d.getMonth() + months)
  return d
}

function addYears(date: Date, years: number) {
  const d = new Date(date)
  d.setFullYear(d.getFullYear() + years)
  return d
}

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

export async function PATCH(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({})) as {
      tier?: 'free' | 'premium'
      interval?: 'monthly' | 'annual' | null
    }

    const tier = body.tier
    const interval = body.interval

    if (tier !== 'free' && tier !== 'premium') {
      return NextResponse.json({ error: 'Invalid tier' }, { status: 400 })
    }
    if (tier === 'premium' && (interval !== 'monthly' && interval !== 'annual')) {
      return NextResponse.json({ error: 'Premium requires interval monthly or annual' }, { status: 400 })
    }

    await connect()
    const user = await User.findOne({ email: session.user.email }) as IUser | null
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (tier === 'free') {
      user.subscriptionTier = 'free'
      user.subscriptionInterval = null
      user.subscriptionCurrentPeriodEnd = null
    } else {
      user.subscriptionTier = 'premium'
      user.subscriptionInterval = interval!
      const now = new Date()
      user.subscriptionCurrentPeriodEnd = interval === 'monthly' ? addMonths(now, 1) : addYears(now, 1)
    }

    await user.save()

    return NextResponse.json({
      ok: true,
      subscriptionTier: user.subscriptionTier,
      subscriptionInterval: user.subscriptionInterval,
      subscriptionCurrentPeriodEnd: user.subscriptionCurrentPeriodEnd
        ? new Date(user.subscriptionCurrentPeriodEnd).toISOString()
        : null,
    })
  } catch (err) {
    console.error('PATCH /api/subscription error:', err)
    return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 })
  }
}
