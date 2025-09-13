import * as React from 'react'

interface ProgressRingProps {
  size?: number
  strokeWidth?: number
  progress: number // 0-100
  trackColor?: string
  progressColor?: string
  glow?: boolean
}

export function ProgressRing({
  size = 140,
  strokeWidth = 10,
  progress,
  trackColor = 'rgba(255,255,255,0.12)',
  progressColor = '#e69ee4', /* plum-web */
  glow = true,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const clamped = Math.max(0, Math.min(100, progress))
  const dash = (clamped / 100) * circumference

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={trackColor}
        strokeWidth={strokeWidth}
        fill="none"
      />

      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={progressColor}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circumference - dash}`}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={glow ? ({ filter: 'url(#glow)' } as React.CSSProperties) : undefined}
      />

      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        fontSize={size * 0.2}
        fill="#FFFFEE" /* ivory */
        style={{ fontWeight: 700 }}
      >
        {Math.round(clamped)}%
      </text>
    </svg>
  )
}

export default ProgressRing
