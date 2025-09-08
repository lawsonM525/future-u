"use client"

import React from "react"
import { cn } from "@/lib/utils"

// A blob-shaped container using clip-path. Content sits on top of a soft gradient.
export function BlobCard({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "relative p-4 sm:p-6 text-foreground",
        className
      )}
      style={{
        WebkitClipPath:
          "path('M29.6-1.1c18.3-.4,36.9,3.7,49.5,15.3,12.6,11.6,19.2,30.8,17.8,49.5-1.3,18.7-10.7,36.8-24.1,47.9-13.4,11.1-30.7,15.4-47,14.5-16.3-.8-31.6-6.8-43.6-17C-10,98.9-18.3,83.6-19.8,67.2c-1.6-16.4,2.7-33.9,12.5-47.1C2.5,6.9,17.9-0.7,29.6-1.1Z')",
        clipPath:
          "path('M29.6-1.1c18.3-.4,36.9,3.7,49.5,15.3,12.6,11.6,19.2,30.8,17.8,49.5-1.3,18.7-10.7,36.8-24.1,47.9-13.4,11.1-30.7,15.4-47,14.5-16.3-.8-31.6-6.8-43.6-17C-10,98.9-18.3,83.6-19.8,67.2c-1.6-16.4,2.7-33.9,12.5-47.1C2.5,6.9,17.9-0.7,29.6-1.1Z')",
        background:
          "radial-gradient(120% 120% at 10% 10%, rgba(250, 234, 98, 0.08), transparent 70%), radial-gradient(120% 120% at 90% 20%, rgba(11, 234, 226, 0.12), transparent 70%), radial-gradient(120% 120% at 50% 90%, rgba(184, 245, 0, 0.08), transparent 70%)",
        border: "1px solid hsl(var(--border))",
      }}
    >
      {children}
    </div>
  )
}
