"use client"

import React, { useEffect, useState } from "react"
import Image from "next/image"
import { Compass } from "lucide-react"
import { useSession } from "next-auth/react"
import AvatarCreator from "@/components/AvatarCreator"
import { cn } from "@/lib/utils"
import { NAV, DashboardSection } from "./nav"

export function MobileBottomNav({
  active,
  onChange,
  className,
}: {
  active: DashboardSection
  onChange: (key: DashboardSection) => void
  className?: string
}) {
  const { data: session } = useSession()
  const [avatarPreferences, setAvatarPreferences] = useState<Record<string, unknown>>({})

  useEffect(() => {
    if (typeof window === 'undefined') return
    const saved = localStorage.getItem('avatarPreferences')
    if (saved) {
      try {
        setAvatarPreferences(JSON.parse(saved))
      } catch {
        // ignore parse errors
      }
    }
  }, [])

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 border-t border-border/60 bg-black/80 backdrop-blur supports-[backdrop-filter]:bg-black/60",
        "px-2 py-2",
        className
      )}
      role="navigation"
      aria-label="Dashboard navigation"
    >
      <ul className="grid grid-cols-6 gap-1">
        {NAV.map(({ key, label, iconSrc }) => {
          const selected = key === active
          const selectedClasses =
            key === "strategy" || key === "resources" || key === "feedback"
              ? "bg-jonquil/15 border border-jonquil text-jonquil"
              : key === "quests"
              ? "bg-plum-web/15 border border-plum-web text-plum-web"
              : key === "goals" || key === "account"
              ? "bg-fluorescent-cyan/15 border border-fluorescent-cyan text-fluorescent-cyan"
              : "bg-jonquil/15 border border-jonquil text-jonquil"
          const unselectedClasses = "bg-black text-muted-foreground hover:bg-black/80"

          return (
            <li key={key} className="flex">
              {key === 'feedback' ? (
                <a
                  href="https://lwsnlabs.featurebase.app/?b=68b4751d77012e1594a760c9"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className={cn(
                    "flex h-11 w-full items-center justify-center rounded-lg",
                    selected ? selectedClasses : unselectedClasses
                  )}
                >
                  {iconSrc ? (
                    <Image
                      src={iconSrc}
                      alt={`${label} icon`}
                      width={22}
                      height={22}
                      className={cn("shrink-0", selected ? "opacity-100" : "opacity-80")}
                    />
                  ) : (
                    <Compass className="w-5 h-5" />
                  )}
                  <span className="sr-only">{label}</span>
                </a>
              ) : (
                <button
                  type="button"
                  aria-label={label}
                  className={cn(
                    "flex h-11 w-full items-center justify-center rounded-lg",
                    selected ? selectedClasses : unselectedClasses
                  )}
                  onClick={() => {
                    try {
                      if (key === 'quests' && typeof window !== 'undefined' && typeof window.datafast === 'function') {
                        window.datafast('premium_feature_clicked', { feature: 'daily_quests_tab' })
                      }
                    } catch {}
                    onChange(key)
                  }}
                >
                  {key === 'account' ? (
                    <AvatarCreator
                      seed={session?.user?.email || ''}
                      size={22}
                      className={cn("rounded-full", selected ? "ring-2 ring-fluorescent-cyan/60" : "")}
                      {...avatarPreferences}
                    />
                  ) : iconSrc ? (
                    <Image
                      src={iconSrc}
                      alt={`${label} icon`}
                      width={22}
                      height={22}
                      className={cn("shrink-0", selected ? "opacity-100" : "opacity-80")}
                    />
                  ) : (
                    <Compass className="w-5 h-5" />
                  )}
                  <span className="sr-only">{label}</span>
                </button>
              )}
            </li>
          )
        })}
      </ul>
      {/* Safe area for iOS */}
      <div className="pb-[env(safe-area-inset-bottom)]" />
    </nav>
  )
}
