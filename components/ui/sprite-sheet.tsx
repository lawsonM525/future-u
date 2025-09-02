'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

export interface SpriteSheetProps {
  // Path to the sprite sheet in /public
  src: string
  // Grid layout
  rows: number
  cols: number
  // Square frame size in pixels (width = height)
  size?: number // default 64
  // Frames per second
  fps?: number // default 9
  // Total frames (if the sheet isn't fully populated). If omitted, uses rows*cols
  frameCount?: number
  // Animation behavior
  autoplay?: boolean // default true
  loop?: boolean // default true
  pingPong?: boolean // default true (bounce at ends)
  // Only animate while hovered
  hoverToPlay?: boolean // default false
  // Styling
  className?: string
  // Accessibility label if needed
  ariaLabel?: string
}

export function SpriteSheet({
  src,
  rows,
  cols,
  size = 64,
  fps = 9,
  frameCount,
  autoplay = true,
  loop = true,
  pingPong = true,
  hoverToPlay = false,
  className = '',
  ariaLabel,
}: SpriteSheetProps) {
  const maxFrame = useMemo(() => (typeof frameCount === 'number' ? Math.max(frameCount - 1, 0) : rows * cols - 1), [frameCount, rows, cols])
  const intervalMs = useMemo(() => Math.max(16, Math.floor(1000 / Math.max(1, fps))), [fps])

  const [frame, setFrame] = useState(0)
  const [direction, setDirection] = useState<1 | -1>(1)
  const [hovered, setHovered] = useState(false)

  const playing = autoplay && (!hoverToPlay || hovered)
  const timerRef = useRef<number | null>(null)

  // Advance frames
  useEffect(() => {
    if (!playing) {
      if (timerRef.current) {
        window.clearInterval(timerRef.current)
        timerRef.current = null
      }
      return
    }

    timerRef.current = window.setInterval(() => {
      setFrame(prev => {
        if (pingPong) {
          const next = prev + direction
          if (next >= maxFrame && direction === 1) {
            if (!loop) return maxFrame // stop
            setDirection(-1)
            return maxFrame
          }
          if (next <= 0 && direction === -1) {
            if (!loop) return 0 // stop
            setDirection(1)
            return 0
          }
          return next
        } else {
          // Simple forward loop
          if (prev >= maxFrame) {
            return loop ? 0 : maxFrame
          }
          return prev + 1
        }
      })
    }, intervalMs) as unknown as number

    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [playing, intervalMs, pingPong, loop, maxFrame, direction])

  const row = Math.floor(frame / cols)
  const col = frame % cols
  const frameSize = size

  // Ensure a leading slash for public assets if not provided
  const url = src.startsWith('/') ? src : `/${src}`

  return (
    <div
      role={ariaLabel ? 'img' : undefined}
      aria-label={ariaLabel}
      className={`inline-block ${className}`}
      style={{
        width: frameSize,
        height: frameSize,
        backgroundImage: `url(${url})`,
        backgroundSize: `${frameSize * cols}px ${frameSize * rows}px`,
        backgroundPosition: `-${col * frameSize}px -${row * frameSize}px`,
        imageRendering: 'auto',
        // Users can add Tailwind hover/transition classes via className
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    />
  )
}
