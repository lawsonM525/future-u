export interface TimelineCheckpoint {
  year: number
  title: string
  /**
   * Optional freeform description (legacy). New timelines should prefer `items` bullets.
   */
  description?: string
  /**
   * Bullet checklist for the year. Each string is a concise, actionable checkpoint.
   */
  items?: string[]
}
