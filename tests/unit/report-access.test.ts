import { describe, expect, it } from 'vitest'
import { getTimelineYears, alignLegacyTimeline } from '../../lib/timeline-years'
import { hashReportToken, newReportToken, normalizeEmail } from '../../lib/guest-report-access'
import { validateQuizSubmission } from '../../lib/quiz-validation'

describe('guest access and quiz validation', () => {
  it('uses fresh unguessable links and stores only a hash', () => {
    const token = newReportToken()
    expect(token).toMatch(/^[a-f0-9]{64}$/)
    expect(new Set(Array.from({ length: 100 }, newReportToken)).size).toBe(100)
    expect(hashReportToken(token)).not.toBe(token)
    expect(hashReportToken(token)).toBe(hashReportToken(token))
    for (const invalid of ['507f1f77bcf86cd799439011', '../../dashboard', '', token + 'a']) expect(hashReportToken(invalid)).toBeNull()
  })
  it('starts the roadmap in the current year, including after New Year', () => {
    expect(getTimelineYears(new Date('2026-10-27T22:00:00Z'))).toEqual([2026, 2027, 2028, 2029, 2030, 2031])
    expect(getTimelineYears(new Date('2027-01-01T00:00:00Z'))).toEqual([2027, 2028, 2029, 2030, 2031, 2032])
  })
  it('corrects a report generated in 2026 with the old 2025 template, preserving historical plans', () => {
    const legacy = Array.from({ length: 6 }, (_, index) => ({ year: 2025 + index, title: `Milestone ${index + 1}` }))
    expect(alignLegacyTimeline(legacy, new Date('2026-10-27')).map(checkpoint => checkpoint.year)).toEqual([2026, 2027, 2028, 2029, 2030, 2031])
    expect(alignLegacyTimeline(legacy, new Date('2025-06-01'))).toBe(legacy)
    expect(legacy[0].year).toBe(2025)
  })
  it('rejects incomplete, invented, all-skipped, or oversized submissions', () => {
    const answers = { 1: 'A student', 2: 'Education', 3: 'Product designer' }
    expect(validateQuizSubmission({ quizType: 'test', answers })).toEqual({ quizType: 'test', answers })
    expect(validateQuizSubmission({ quizType: 'unknown', answers })).toBeNull()
    expect(validateQuizSubmission({ quizType: 'test', answers: { 1: 'Only one' } })).toBeNull()
    expect(validateQuizSubmission({ quizType: 'test', answers: { ...answers, 999: 'Invented' } })).toBeNull()
    expect(validateQuizSubmission({ quizType: 'test', answers: { ...answers, 1: 'word '.repeat(101) } })).toBeNull()
    expect(validateQuizSubmission({ quizType: 'test', answers: { 1: '[question skipped]', 2: '[question skipped]', 3: '[question skipped]' } })).toBeNull()
  })
  it('normalizes email addresses and rejects header/HTML injection', () => {
    expect(normalizeEmail(' Person@Example.com ')).toBe('person@example.com')
    for (const invalid of ['a@example.com\r\nBcc: other@example.com', '<img>@example.com', 'no-email', {}, null]) expect(normalizeEmail(invalid)).toBeNull()
  })
})
