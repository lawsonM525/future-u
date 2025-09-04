import * as React from 'react'
import { cn } from '@/lib/utils'

interface GlowCardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: boolean
}

export function GlowCard({ className, children, glow = true, ...props }: GlowCardProps) {
  return (
    <div
      className={cn(
        'relative rounded-2xl border border-white/10 bg-card/60 backdrop-blur-sm shadow-[0_0_0_1px_rgba(255,255,255,0.04)] overflow-hidden',
        className
      )}
      {...props}
    >
      {glow && (
        <div
          className="pointer-events-none absolute -inset-24 rounded-full"
          style={{
            background: 'radial-gradient(60% 60% at 50% 0%, rgba(139,92,246,0.25) 0%, rgba(139,92,246,0.10) 35%, rgba(0,0,0,0) 70%)'
          }}
        />
      )}
      <div className="relative">
        {children}
      </div>
    </div>
  )}

export default GlowCard
