'use client'

import { StarSprite } from '@/components/ui/star-sprite'
import { SpriteSheet } from '@/components/ui/sprite-sheet'
import { useEffect } from 'react'

// Add TypeScript interface for the Tally window object
declare global {
  interface Window {
    Tally?: {
      loadEmbeds: () => void
    }
  }
}

export default function WaitlistPage() {

  useEffect(() => {
    const d = document
    const w = 'https://tally.so/widgets/embed.js'
    const v = function () {
      if (typeof window !== 'undefined' && window.Tally) {
        window.Tally.loadEmbeds()
      } else {
        d.querySelectorAll('iframe[data-tally-src]:not([src])').forEach((e) => {
          const iframe = e as HTMLIFrameElement & { dataset: { tallySrc?: string } }
          if (iframe.dataset?.tallySrc) {
            iframe.src = iframe.dataset.tallySrc
          }
        })
      }
    }
    if (typeof window !== 'undefined' && window.Tally) {
      v()
    } else if (d.querySelector(`script[src="${w}"]`) == null) {
      const s = d.createElement('script')
      s.src = w
      s.onload = v
      s.onerror = v
      d.body.appendChild(s)
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        v()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  // No Tally postMessage listener; Tally handles redirect itself

  return (
    <div className="min-h-[100svh] md:min-h-screen flex flex-col relative p-4 animate-fade-in">
      {/* No global actions on waitlist page */}

      {/* Main content - centered hero */}
      <div className="flex flex-col items-center justify-start mt-16 w-full max-w-3xl mx-auto text-center">
        {/* Top Star (mobile only) */}
        <div className="md:hidden mb-4">
          <span className="inline-block transition-transform duration-200 ease-out hover:scale-[1.2]">
            <StarSprite size={64} />
          </span>
        </div>
        <h1 className="text-lg md:text-4xl font-bold leading-tight animate-slide-up text-center flex items-center justify-center gap-0 md:gap-3 font-rubik-mono-one">
          <span className="hidden md:inline-block transition-transform duration-200 ease-out hover:scale-[1.2]">
            <StarSprite size={128} />
          </span>
          Make your dream life a reality.
          <span className="hidden md:inline-block transition-transform duration-200 ease-out hover:scale-[1.2]">
            <StarSprite size={128} />
          </span>
        </h1>
        <p className="text-md mt-6 text-center animate-slide-up">
          Get clear on what you want, feel confident in your plan, and start your mission today.
        </p>
      </div>

      {/* Tally embed (CTA) */}
      <div className="w-full max-w-3xl mx-auto mt-10">
        <div className="w-full overflow-hidden rounded-xl">
          <iframe
            data-tally-src="https://tally.so/embed/mORPX8?alignLeft=1&hideTitle=1&dynamicHeight=1&formEventsForwarding=1"
            loading="lazy"
            width="100%"
            height="100"
            frameBorder="0"
            marginHeight={0}
            marginWidth={0}
            title="Future U Waitlist"
          ></iframe>
        </div>
      </div>

      {/* Outcomes (animated bubble pills) */}
      <div className="hidden md:block w-full max-w-3xl mx-auto mt-8">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm animate-pulse" style={{ animationDelay: '0.1s' }}>Clarity</span>
          <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm animate-pulse" style={{ animationDelay: '0.3s' }}>Confidence</span>
          <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm animate-pulse" style={{ animationDelay: '0.5s' }}>Accountability</span>
        </div>
      </div>

      {/* How it works bullets (sprite-sheet bullets, 1rem spacing) */}
      <div className="w-full max-w-3xl mx-auto mt-10">
        <ul className="space-y-4 text-gray-200">
          <li className="flex items-start gap-3">
            <span className="md:hidden"><SpriteSheet src="/sprites/sparkles-3x3.png" rows={3} cols={3} size={24} fps={10} ariaLabel="Sparkle bullet" className="mt-0.5" /></span>
            <span className="hidden md:inline-block"><SpriteSheet src="/sprites/sparkles-3x3.png" rows={3} cols={3} size={20} fps={10} ariaLabel="Sparkle bullet" className="mt-0.5" /></span>
            <span>An honest quiz that figures out where you are now and where you want to be</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="md:hidden"><SpriteSheet src="/sprites/sparkles-3x3.png" rows={3} cols={3} size={24} fps={10} ariaLabel="Sparkle bullet" className="mt-0.5" /></span>
            <span className="hidden md:inline-block"><SpriteSheet src="/sprites/sparkles-3x3.png" rows={3} cols={3} size={20} fps={10} ariaLabel="Sparkle bullet" className="mt-0.5" /></span>
            <span>A personalized, actionable and resource-rich plan to make it happen</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="md:hidden"><SpriteSheet src="/sprites/sparkles-3x3.png" rows={3} cols={3} size={24} fps={10} ariaLabel="Sparkle bullet" className="mt-0.5" /></span>
            <span className="hidden md:inline-block"><SpriteSheet src="/sprites/sparkles-3x3.png" rows={3} cols={3} size={20} fps={10} ariaLabel="Sparkle bullet" className="mt-0.5" /></span>
            <span>Monthly goals and daily quests that keep you on track</span>
          </li>
        </ul>
      </div>

      {/* Privacy line */}
      <div className="w-full max-w-3xl mx-auto mt-6">
        <p className="text-center text-sm text-gray-400">
          No spam. We&apos;ll email you when Future U goes live.
        </p>
      </div>

      {/* No sign-in prompt on the waitlist page */}

      {/* Social proof at the very bottom */}
      <div className="w-full text-center mt-auto">
        <p className="text-gray-300 font-light">
          <span className="font-semibold text-white">100+</span> already in line. Save your spot.
        </p>
      </div>
    </div>
  )
}
