"use client"

import React from "react"
import Link from "next/link"
import { Progress } from "@/components/ui/progress"
import { GlowCard } from "@/components/ui/GlowCard"
import { Target, Star, Zap } from "lucide-react"

const quests = [
  { id: 1, icon: <Zap className="w-4 h-4" />, title: "Earn 50 XP", value: 50, max: 50, color: "bg-jonquil" },
  { id: 2, icon: <Target className="w-4 h-4" />, title: "Score 90%+ in 3 lessons", value: 2, max: 3, color: "bg-fluorescent-cyan" },
  { id: 3, icon: <Star className="w-4 h-4" />, title: "Get 10 in a row", value: 4, max: 10, color: "bg-plum-web" },
]

// TODO: Make these more spaced out 
export function DailyQuests() {
  return (
    <GlowCard className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Daily Quests</h3>
        <Link href="/quests" className="text-xs text-fluorescent-cyan hover:underline">View all</Link>
      </div>
      <div className="space-y-4">
        {quests.map((q) => (
          <div key={q.id} className="space-y-2 p-2 rounded-lg hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-3 text-sm md:text-base">
              <div className="w-7 h-7 grid place-items-center rounded-full bg-white/5 border border-border">
                {q.icon}
              </div>
              <span className="text-foreground/90">{q.title}</span>
              <span className="ml-auto text-[11px] md:text-xs px-2 py-0.5 rounded-full bg-white/10 text-foreground/70 font-medium">
                {q.value} / {q.max}
              </span>
            </div>
            <Progress value={(q.value / q.max) * 100} className="h-2.5 bg-white/10 rounded-full" indicatorClassName={q.color} />
          </div>
        ))}
      </div>
    </GlowCard>
  )
}
