import * as React from 'react'
import { cn } from '@/lib/utils'

interface GlowCardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: boolean
}

export function GlowCard({ className, children, glow = true, ...props }: GlowCardProps) {
  return (
    <div
      className={cn(
        'relative rounded-2xl border border-border bg-card overflow-hidden',
        className
      )}
      {...props}
    >
      {glow && (
        <div
          className="pointer-events-none absolute -inset-24 rounded-full"
          style={{
            background: 'radial-gradient(60% 60% at 50% 0%, rgba(253, 202, 0, 0.15) 0%, rgba(253, 202, 0, 0.05) 35%, rgba(0,0,0,0) 70%)' /* jonquil */
          }}
        />
      )}
      <div className="relative">
        {children}
      </div>
    </div>
  )}

export default GlowCard
