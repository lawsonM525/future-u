"use client"

import React from "react"
import Image from "next/image"
import { Compass } from "lucide-react"
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
      <ul className="grid grid-cols-7 gap-1">
        {NAV.map(({ key, label, iconSrc }) => {
          const selected = key === active
          const selectedClasses =
            key === "strategy" || key === "resources" || key === "feedback"
              ? "bg-jonquil/15 border border-jonquil text-jonquil"
              : key === "friends" || key === "quests"
              ? "bg-plum-web/15 border border-plum-web text-plum-web"
              : key === "goals" || key === "coach"
              ? "bg-fluorescent-cyan/15 border border-fluorescent-cyan text-fluorescent-cyan"
              : "bg-jonquil/15 border border-jonquil text-jonquil"
          const unselectedClasses = "bg-black text-muted-foreground hover:bg-black/80"

          return (
            <li key={key} className="flex">
              <button
                type="button"
                aria-label={label}
                className={cn(
                  "flex h-11 w-full items-center justify-center rounded-lg",
                  selected ? selectedClasses : unselectedClasses
                )}
                onClick={() => onChange(key)}
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
              </button>
            </li>
          )
        })}
      </ul>
      {/* Safe area for iOS */}
      <div className="pb-[env(safe-area-inset-bottom)]" />
    </nav>
  )
}
