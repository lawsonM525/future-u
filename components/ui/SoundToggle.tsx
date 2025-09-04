"use client"
import * as React from 'react'
import { useSound } from '@/hooks/useSound'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

export function SoundToggle({ className }: { className?: string }) {
  const { enabled, setEnabled } = useSound()
  return (
    <div className={className}>
      <div className="flex items-center gap-2">
        <Switch id="sound-toggle" checked={enabled} onCheckedChange={setEnabled} />
        <Label htmlFor="sound-toggle" className="text-sm text-muted-foreground">Sound</Label>
      </div>
    </div>
  )
}

export default SoundToggle
