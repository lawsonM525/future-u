"use client"

import React from "react"
import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Compass } from "lucide-react"

// Use PNG icons from /public/icons where available; fall back to lucide for any missing asset
const NAV = [
  { key: "strategy", label: "Strategy", iconSrc: null as string | null },
  { key: "goals", label: "Goals", iconSrc: "/icons/goals.png" },
  { key: "quests", label: "Quests", iconSrc: "/icons/quests.png" },
  { key: "resources", label: "Resources", iconSrc: "/icons/resources.png" },
  { key: "coach", label: "Coach", iconSrc: "/icons/coach.png" },
  { key: "friends", label: "Friends", iconSrc: "/icons/friends.png" },
  { key: "feedback", label: "Feedback", iconSrc: "/icons/feedback.png" },
] as const

export type DashboardSection = typeof NAV[number]["key"]

export function SidebarNav({
  active,
  onChange,
  className,
}: {
  active: DashboardSection
  onChange: (key: DashboardSection) => void
  className?: string
}) {
  return (
    <aside className={cn("md:sticky md:top-4 space-y-4", className)}>
      <div className="px-2">
        <Link
          href="/"
          className="inline-block text-2xl font-bold font-space-grotesk text-jonquil transition-transform duration-150 hover:scale-105"
        >
          Future U
        </Link>
      </div>
      <nav className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible px-1">
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
            <button
              key={key}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg",
                selected ? selectedClasses : unselectedClasses
              )}
              onClick={() => onChange(key)}
            >
              {iconSrc ? (
                <Image
                  src={iconSrc}
                  alt={`${label} icon`}
                  width={20}
                  height={20}
                  className={cn("shrink-0", selected ? "opacity-100" : "opacity-80")}
                />
              ) : (
                <Compass className="w-5 h-5" />
              )}
              <span className="text-sm font-medium">{label}</span>
            </button>
          )
        })}
      </nav>
    </aside>
  )
}
