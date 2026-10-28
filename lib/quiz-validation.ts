import { getQuizConfig } from '@/lib/quiz-data'

export function validateQuizSubmission(body: unknown): { quizType: string; answers: Record<string, string> } | null {
  if (!body || typeof body !== 'object') return null
  const { quizType, answers } = body as Record<string, unknown>
  if (typeof quizType !== 'string') return null
  const config = getQuizConfig(quizType)
  if (!config || !answers || typeof answers !== 'object' || Array.isArray(answers)) return null
  const values = answers as Record<string, unknown>
  const ids = new Set(config.questions.map(question => String(question.id)))
  if (Object.keys(values).length !== ids.size || Object.keys(values).some(id => !ids.has(id))) return null
  const clean: Record<string, string> = {}
  for (const question of config.questions) {
    const answer = values[String(question.id)]
    if (typeof answer !== 'string' || !answer.trim() || answer.length > 4000 || answer.trim().split(/\s+/).length > (question.maxWords || 100)) return null
    clean[String(question.id)] = answer.trim()
  }
  if (Object.values(clean).every(value => value === '[question skipped]')) return null
  return { quizType, answers: clean }
}
