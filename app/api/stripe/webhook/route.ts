import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { connect } from '@/lib/mongodb'
import { User } from '@/models/User'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const maxDuration = 60

function toInterval(recurring: Stripe.Price.Recurring | null | undefined): 'monthly' | 'annual' | null {
  const iv = recurring?.interval
  if (iv === 'month') return 'monthly'
  if (iv === 'year') return 'annual'
  return null
}

async function getEmailFromSession(stripe: Stripe, session: Stripe.Checkout.Session): Promise<string | null> {
  const direct = session.customer_details?.email || session.customer_email || null
  if (direct) return direct
  const custId = session.customer
  if (typeof custId === 'string') {
    try {
      const customer = await stripe.customers.retrieve(custId)
      if (!customer || (customer as Stripe.DeletedCustomer).deleted) return null
      return (customer as Stripe.Customer).email || null
    } catch {
      return null
    }
  }
  return null
}

async function getEmailFromCustomerId(stripe: Stripe, customerId: string | null | undefined): Promise<string | null> {
  if (!customerId || typeof customerId !== 'string') return null
  try {
    const customer = await stripe.customers.retrieve(customerId)
    if (!customer || (customer as Stripe.DeletedCustomer).deleted) return null
    return (customer as Stripe.Customer).email || null
  } catch {
    return null
  }
}

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  const sk = process.env.STRIPE_SECRET_KEY
  if (!secret || !sk) {
    console.error('Stripe webhook misconfigured: missing STRIPE_WEBHOOK_SECRET or STRIPE_SECRET_KEY')
    return new NextResponse('Server misconfigured', { status: 500 })
  }

  const stripe = new Stripe(sk)

  const sig = request.headers.get('stripe-signature')
  if (!sig) {
    return new NextResponse('Missing signature', { status: 400 })
  }

  let event: Stripe.Event
  const payload = await request.text()
  try {
    event = stripe.webhooks.constructEvent(payload, sig, secret)
  } catch (err) {
    console.error('Stripe signature verification failed:', err)
    return new NextResponse('Invalid signature', { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        // Only proceed for subscription mode sessions
        if (session.mode === 'subscription' && session.subscription) {
          const subId = typeof session.subscription === 'string' ? session.subscription : session.subscription.id
          const subscription = await stripe.subscriptions.retrieve(subId, { expand: ['items.data.price'] }) as unknown as Stripe.Subscription
          const price = subscription.items.data[0]?.price as Stripe.Price | null
          const interval = toInterval(price?.recurring || undefined)
          const subShape = subscription as unknown as { current_period_end?: number }
          const currentPeriodEnd = subShape.current_period_end ? new Date(subShape.current_period_end * 1000) : null

          const email = await getEmailFromSession(stripe, session)
          if (email) {
            await connect()
            const user = await User.findOne({ email })
            if (user) {
              user.subscriptionTier = 'premium'
              user.subscriptionInterval = interval
              user.subscriptionCurrentPeriodEnd = currentPeriodEnd
              await user.save()
            }
          }
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const email = await getEmailFromCustomerId(stripe, typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id)
        if (email) {
          await connect()
          const user = await User.findOne({ email })
          if (user) {
            user.subscriptionTier = 'free'
            user.subscriptionInterval = null
            user.subscriptionCurrentPeriodEnd = null
            await user.save()
          }
        }
        break
      }

      default:
        // Ignore other events for now
        break
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('Stripe webhook handler error:', err)
    return new NextResponse('Webhook error', { status: 500 })
  }
}
