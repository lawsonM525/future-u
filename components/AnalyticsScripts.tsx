'use client'

import Script from 'next/script'
import { usePathname } from 'next/navigation'

export function AnalyticsScripts() {
  const pathname = usePathname()
  // Private report links and report contents must not reach analytics providers.
  if (pathname.startsWith('/results/')) return null
  return <>
    <Script strategy="afterInteractive" src="https://www.googletagmanager.com/gtag/js?id=G-9Y008B0W5Z" />
    <Script id="google-analytics" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: `window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', 'G-9Y008B0W5Z');` }} />
    <Script defer data-website-id="68b369d183c35f185a6d208d" data-domain="future-u.app" src="https://datafa.st/js/script.js" />
  </>
}
