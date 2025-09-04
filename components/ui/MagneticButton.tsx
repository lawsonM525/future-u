"use client"
import * as React from 'react'
import { motion, useMotionValue, useSpring, useTransform, type HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'

type MagneticButtonProps = HTMLMotionProps<'button'> & { asChild?: boolean }

export function MagneticButton({ className, children, ...props }: MagneticButtonProps) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 200, damping: 15 })
  const springY = useSpring(y, { stiffness: 200, damping: 15 })

  const rotateX = useTransform(springY, [-30, 30], [8, -8])
  const rotateY = useTransform(springX, [-30, 30], [-8, 8])

  const ref = React.useRef<HTMLButtonElement | null>(null)

  function onMouseMove(e: React.MouseEvent) {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const relX = e.clientX - rect.left
    const relY = e.clientY - rect.top
    const dx = (relX - rect.width / 2) / (rect.width / 2)
    const dy = (relY - rect.height / 2) / (rect.height / 2)
    x.set(dx * 30)
    y.set(dy * 30)
  }

  function onMouseLeave() {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.button
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
      }}
      className={cn(
        'relative rounded-xl bg-card/70 backdrop-blur-sm border border-white/10 px-5 py-4 shadow-md transition-colors hover:bg-card/80',
        className
      )}
      {...props}
    >
      <span style={{ transform: 'translateZ(20px)', display: 'inline-block' }}>{children as React.ReactNode}</span>
    </motion.button>
  )
}

export default MagneticButton
