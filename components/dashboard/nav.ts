"use client"

export const NAV = [
  { key: "strategy", label: "Strategy", iconSrc: null as string | null },
  { key: "guides", label: "Guides", iconSrc: null as string | null },
  { key: "goals", label: "Goals", iconSrc: "/icons/goals.png" },
  { key: "quests", label: "Quests", iconSrc: "/icons/quests.png" },
  { key: "resources", label: "Resources", iconSrc: "/icons/resources.png" },
  { key: "feedback", label: "Feedback", iconSrc: "/icons/feedback.png" },
  { key: "account", label: "Account", iconSrc: null as string | null },
] as const

// Include additional keys that may be conditionally rendered but not in NAV
export type DashboardSection = typeof NAV[number]["key"] | "coach" | "friends"
