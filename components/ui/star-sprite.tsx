'use client'

import { useState, useEffect } from 'react'

interface StarSpriteProps {
  className?: string
  size?: number
}

export function StarSprite({ className = '', size = 24 }: StarSpriteProps) {
  const [currentFrame, setCurrentFrame] = useState(0)
  const [direction, setDirection] = useState(1) // 1 for forward, -1 for backward

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFrame((prev) => {
        const nextFrame = prev + direction
        
        // If we've reached the end (frame 8), start going backward
        if (nextFrame >= 8 && direction === 1) {
          setDirection(-1)
          return 8
        }
        
        // If we've reached the beginning (frame 0), start going forward
        if (nextFrame <= 0 && direction === -1) {
          setDirection(1)
          return 0
        }
        
        return nextFrame
      })
    }, 111) // ~9 frames per second

    return () => clearInterval(interval)
  }, [direction])

  // Calculate frame position (3x3 grid)
  const row = Math.floor(currentFrame / 3)
  const col = currentFrame % 3
  const frameSize = size
  
  return (
    <div
      className={`inline-block ${className}`}
      style={{
        width: frameSize,
        height: frameSize,
        backgroundImage: 'url(/star-sprite.png)',
        backgroundSize: `${frameSize * 3}px ${frameSize * 3}px`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: `-${col * frameSize}px -${row * frameSize}px`,
        imageRendering: 'pixelated'
      }}
    />
  )
}