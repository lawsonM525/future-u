'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

const ROTATING_PROMPTS = [
  'Share this with your accountability partner',
  'Share this with your ride or die',
  'Share this with your lock-in buddy',
]

export default function WaitlistSuccessPage() {
  const [idx, setIdx] = useState(0)
  const [copied, setCopied] = useState(false)

  // Rotate prompt every 2.5s
  useEffect(() => {
    const id = window.setInterval(() => {
      setIdx((i) => (i + 1) % ROTATING_PROMPTS.length)
    }, 2500)
    return () => window.clearInterval(id)
  }, [])

  // Use a fixed domain to avoid SSR/CSR hydration mismatches
  const shareText = "Yo, check this out. Check out this site. Apparently, they're helping you figure out what your dream life is and how to get there. I'm kind of excited for it.. https://future-u.app/waitlist"

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (e) {
      // Fallback for older browsers
      const textarea = document.createElement('textarea')
      textarea.value = shareText
      document.body.appendChild(textarea)
      textarea.select()
      try { document.execCommand('copy') } catch {}
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-4 animate-fade-in">
      <div className="w-full max-w-3xl mx-auto text-center mt-16">
        <h1 className="text-lg md:text-4xl font-bold leading-tight">
          You&apos;re on the list. Be on the lookout for an email from us.
        </h1>
        <p className="text-md mt-8">Future U is coming very, very, very soon. 😉</p>

        <div className="mt-10">
          <div className="text-sm text-gray-300 h-5 transition-opacity duration-300">
            {ROTATING_PROMPTS[idx]}
          </div>
          <div className="mt-4">
            <Button
              variant="yellow"
              size="lg"
              className="font-bold rounded-full"
              onClick={copyToClipboard}
            >
              {copied ? 'Copied!' : 'Copy message'}
            </Button>
          </div>
          <div className="sr-only" aria-live="polite">{copied ? 'Copied to clipboard' : ''}</div>
        </div>

        <div className="mt-10 text-xs text-gray-400 break-words opacity-80">
          <div className="mb-1">Message preview:</div>
          <code className="block text-left bg-white/5 border border-white/10 rounded-md p-3">{shareText}</code>
        </div>
      </div>

      <div className="w-full text-center mt-auto pb-8">
        <p className="text-gray-300 font-light">
          <span className="font-semibold text-white">100+</span> already in line. Save your spot.
        </p>
      </div>
    </div>
  )
}
