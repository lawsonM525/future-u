'use client'

import { usePathname } from 'next/navigation'

export function BetaBanner() {
  const pathname = usePathname()
  const hideOnWaitlist = pathname?.startsWith('/waitlist')
  if (hideOnWaitlist) return null

  return (
    <div className="bg-yellow-300 text-black">
      <div className="max-w-7xl mx-auto px-4 py-2 text-center text-sm">
        <span className="font-semibold">Beta:</span> This website is still in beta — feel free to try it, but you might run into a bug. If you do, or you have feedback or want to request a feature, tell us{' '}
        <a
          href="https://lwsnlabs.featurebase.app/?b=68b4751d77012e1594a760c9"
          target="_blank"
          rel="noopener noreferrer"
          className="underline font-semibold"
        >
          here
        </a>
        .
      </div>
    </div>
  )
}
