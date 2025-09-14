"use client"

export const NAV = [
  { key: "strategy", label: "Strategy", iconSrc: null as string | null },
  { key: "goals", label: "Goals", iconSrc: "/icons/goals.png" },
  { key: "quests", label: "Quests", iconSrc: "/icons/quests.png" },
  { key: "resources", label: "Resources", iconSrc: "/icons/resources.png" },
  { key: "coach", label: "Coach", iconSrc: "/icons/coach.png" },
  { key: "friends", label: "Friends", iconSrc: "/icons/friends.png" },
  { key: "feedback", label: "Feedback", iconSrc: "/icons/feedback.png" },
] as const

export type DashboardSection = typeof NAV[number]["key"]
