"use client"

import React from "react"
import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Compass } from "lucide-react"
import { NAV, DashboardSection } from "./nav"

// Shared NAV config is imported from ./nav

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
    <aside className={cn("space-y-4", className)}>
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
          const unselectedClasses = "bg-black text-foreground hover:bg-black/80"
          return (
            key === 'feedback' ? (
              <a
                key={key}
                href="https://lwsnlabs.featurebase.app/?b=68b4751d77012e1594a760c9"
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg",
                  selected ? selectedClasses : unselectedClasses
                )}
                aria-label={label}
              >
                {iconSrc ? (
                  <Image
                    src={iconSrc}
                    alt={`${label} icon`}
                    width={24}
                    height={24}
                    className={cn("shrink-0", selected ? "opacity-100" : "opacity-80")}
                  />
                ) : (
                  <Compass className="w-6 h-6" />
                )}
                <span className="text-base font-medium">{label}</span>
              </a>
            ) : (
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
                    width={24}
                    height={24}
                    className={cn("shrink-0", selected ? "opacity-100" : "opacity-80")}
                  />
                ) : (
                  <Compass className="w-6 h-6" />
                )}
                <span className="text-base font-medium">{label}</span>
              </button>
            )
          )
        })}
      </nav>
    </aside>
  )
}
