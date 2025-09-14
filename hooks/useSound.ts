"use client"
import * as React from 'react'

const SOUND_MAP = {
  complete: '/sounds/twinkling.wav',
  levelup: '/sounds/yipee.mp3',
  plop: '/sounds/plop.mp3',
  ding: '/sounds/ding.mp3',
} as const

type SoundName = keyof typeof SOUND_MAP

interface SoundContextValue {
  enabled: boolean
  setEnabled: (v: boolean) => void
  play: (name: SoundName, volume?: number) => void
}

const SoundContext = React.createContext<SoundContextValue | undefined>(undefined)

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabled] = React.useState<boolean>(true)
  const audioRefs = React.useRef<Partial<Record<SoundName, HTMLAudioElement>>>({})

  React.useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = window.localStorage.getItem('soundEnabled')
    if (stored !== null) setEnabled(stored === 'true')
    // Preload audio elements
    for (const key of Object.keys(SOUND_MAP) as SoundName[]) {
      const el = new Audio(SOUND_MAP[key])
      el.preload = 'auto'
      audioRefs.current[key] = el
    }
  }, [])

  const play = React.useCallback((name: SoundName, volume = 0.4) => {
    if (!enabled) return
    const el = audioRefs.current[name]
    if (!el) return
    // restart from beginning for rapid feedback
    el.currentTime = 0
    el.volume = volume
    el.play().catch(() => {})
  }, [enabled])

  const value = React.useMemo(() => ({ enabled, setEnabled: (v: boolean) => {
    setEnabled(v)
    if (typeof window !== 'undefined') window.localStorage.setItem('soundEnabled', String(v))
  }, play }), [enabled, play])

  return React.createElement(SoundContext.Provider, { value }, children)
}

export function useSound() {
  const ctx = React.useContext(SoundContext)
  if (!ctx) throw new Error('useSound must be used within SoundProvider')
  return ctx
}
