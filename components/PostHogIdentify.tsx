"use client"

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import posthog from 'posthog-js'

export function PostHogIdentify() {
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.id) {
      const distinctId = String(session.user.id)
      const props: Record<string, unknown> = {
        email: session.user.email || undefined,
        name: session.user.name || undefined,
        subscription_tier: session.user.subscriptionTier ?? 'free',
        subscription_interval: session.user.subscriptionInterval ?? null,
      }
      // Identify the user and set person properties
      posthog.identify(distinctId, props)
      // Also register properties as event super properties for convenience
      posthog.register({
        user_id: distinctId,
        user_email: session.user.email || undefined,
        subscription_tier: session.user.subscriptionTier ?? 'free',
      })
    } else if (status === 'unauthenticated') {
      // Clear identity on sign-out
      posthog.reset()
    }
  }, [session, status])

  return null
}
