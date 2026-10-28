import type { Metadata } from 'next'
import GuestResults from '@/components/report/GuestResults'

export const metadata: Metadata = {
  title: 'Your results',
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
  referrer: 'no-referrer',
}

export default function ResultsPage({ params }: { params: { token: string } }) {
  return <GuestResults token={params.token} />
}
