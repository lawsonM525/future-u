import 'next-auth'

// Module augmentation for NextAuth.js to include our custom fields on the Session

declare module 'next-auth' {
  interface Session {
    user?: {
      id?: string
      name?: string | null
      email?: string | null
      image?: string | null
      subscriptionTier?: 'free' | 'premium'
      subscriptionInterval?: 'monthly' | 'annual' | null
      subscriptionCurrentPeriodEnd?: string | Date | null
    }
  }
}
