'use client'

import Script from 'next/script'
import { useEffect } from 'react'

// Add TypeScript interface for the Tally window object
declare global {
  interface Window {
    Tally?: {
      loadEmbeds: () => void;
    };
  }
}

export default function FeatureRequest() {
  useEffect(() => {
    // Load Tally script dynamically
    const loadTally = async () => {
      if (window.Tally) {
        window.Tally.loadEmbeds()
      }
    }
    
    // Call loadTally when the component mounts
    loadTally()
    
    // Also attempt to reload when visibility changes (helps when returning to the page)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && window.Tally) {
        window.Tally.loadEmbeds()
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  return (
    <div className="h-screen w-full overflow-hidden">
      <iframe 
        data-tally-src="https://tally.so/r/wA97Gk" 
        width="100%" 
        height="100%" 
        frameBorder="0"
        className="w-full h-full"
        title="Feature requests - Future U"
      ></iframe>
      <Script 
        src="https://tally.so/widgets/embed.js" 
        strategy="afterInteractive"
        onLoad={() => {
          if (window.Tally) {
            window.Tally.loadEmbeds()
          }
        }}
      />
    </div>
  )
}
