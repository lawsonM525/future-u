"use client"
import * as React from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export function ShareSheet({
  open,
  onOpenChange,
  text,
  ogUrl,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  text: string
  ogUrl: string
}) {
  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''
  const encoded = encodeURIComponent(`${text}\n\n${shareUrl}`)

  async function handleDownload() {
    try {
      const res = await fetch(`${ogUrl}?text=${encodeURIComponent(text)}`)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'futureu-highlight.png'
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (e) {
      console.error('Download failed', e)
    }
  }

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={() => onOpenChange(false)} />
      <div className={cn(
        'relative w-full sm:w-[480px] bg-card border border-white/10 rounded-t-2xl sm:rounded-2xl p-4 sm:p-6 shadow-lg',
      )}>
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <div className="text-xs uppercase text-muted-foreground">Share highlight</div>
            <div className="mt-1 text-sm text-foreground line-clamp-6 whitespace-pre-wrap">{text}</div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
          <Button asChild variant="outline" className="w-full text-xs">
            <a target="_blank" rel="noreferrer" href={`https://twitter.com/intent/tweet?text=${encoded}`}>Twitter / X</a>
          </Button>
          <Button asChild variant="outline" className="w-full text-xs">
            <a target="_blank" rel="noreferrer" href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}>LinkedIn</a>
          </Button>
          <Button variant="outline" className="w-full text-xs" onClick={handleDownload}>Download Card</Button>
          <Button variant="outline" className="w-full text-xs" onClick={() => navigator.clipboard.writeText(text)}>Copy Text</Button>
        </div>
        <div className="mt-4 flex justify-end">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Close</Button>
        </div>
      </div>
    </div>
  )
}
