import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  auth: vi.fn(), connect: vi.fn(), allow: vi.fn(), send: vi.fn(),
  guest: { create: vi.fn(), findOne: vi.fn(), findOneAndUpdate: vi.fn(), updateOne: vi.fn() },
  report: { findOneAndUpdate: vi.fn() }, timeline: { findOneAndUpdate: vi.fn() },
  generate: vi.fn(), generateTimeline: vi.fn(),
}))
vi.mock('@/lib/mongodb', () => ({ connect: mocks.connect }))
vi.mock('@/app/utils/authOptions', () => ({ auth: mocks.auth }))
vi.mock('@/models/GuestReport', () => ({ GuestReport: mocks.guest }))
vi.mock('@/models/Report', () => ({ Report: mocks.report }))
vi.mock('@/models/Timeline', () => ({ Timeline: mocks.timeline }))
vi.mock('@/lib/request-limit', () => ({ allowRequest: mocks.allow, requestAddress: () => 'test-ip' }))
vi.mock('@/lib/generate-career-report', () => ({ generateCareerReport: mocks.generate }))
vi.mock('@/lib/generate-timeline', () => ({ generateTimeline: mocks.generateTimeline }))
vi.mock('resend', () => ({ Resend: class { emails = { send: mocks.send } } }))

import { POST as createReport } from '../../app/api/guest-reports/route'
import { GET as getReport, POST as generateReport } from '../../app/api/guest-reports/[token]/route'
import { POST as saveReport } from '../../app/api/guest-reports/[token]/save/route'
import { POST as emailReport } from '../../app/api/guest-reports/[token]/email/route'

const token = 'a'.repeat(64)
const context = { params: { token } }
const request = (body: unknown = {}, url = 'https://untrusted-host.example/api') => new Request(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })

beforeEach(() => {
  vi.resetAllMocks()
  mocks.auth.mockResolvedValue(null)
  mocks.allow.mockResolvedValue(true)
  mocks.guest.updateOne.mockResolvedValue({})
  mocks.report.findOneAndUpdate.mockResolvedValue({})
  mocks.timeline.findOneAndUpdate.mockResolvedValue({})
  process.env.RESEND_API_KEY = 'test-only'
  process.env.NEXTAUTH_URL = 'https://www.future-u.app'
})

describe('guest report routes', () => {
  it('creates a report without authentication and does not store the raw URL token', async () => {
    const response = await createReport(request({ quizType: 'test', answers: { 1: 'Student', 2: 'Education', 3: 'Designer' } }))
    expect(response.status).toBe(201)
    const { url } = await response.json()
    expect(url).toMatch(/^\/results\/[a-f0-9]{64}$/)
    const stored = mocks.guest.create.mock.calls[0][0]
    expect(stored.tokenHash).not.toBe(url.split('/').pop())
    expect(mocks.auth).not.toHaveBeenCalled()
  })
  it('limits public report generation before creating records', async () => {
    mocks.allow.mockResolvedValue(false)
    expect((await createReport(request({ quizType: 'test', answers: { 1: 'Student', 2: 'Education', 3: 'Designer' } }))).status).toBe(429)
    expect(mocks.guest.create).not.toHaveBeenCalled()
  })
  it('rejects invalid bearer links before touching the database', async () => {
    expect((await getReport(request(), { params: { token: '507f1f77bcf86cd799439011' } })).status).toBe(404)
    expect(mocks.connect).not.toHaveBeenCalled()
  })
  it('returns only report content, never answers, account IDs, or raw profiles', async () => {
    mocks.guest.findOne.mockResolvedValue({ status: 'ready', content: 'Report', summary: 'Summary', checkpoints: [], attempts: 1, answers: { 1: 'Private answer' }, userId: 'private-account', userProfile: 'Private profile', tokenHash: 'private-hash' })
    const response = await getReport(request(), context)
    const body = JSON.stringify(await response.json())
    expect(body).toContain('Report')
    for (const secret of ['Private answer', 'private-account', 'Private profile', 'private-hash']) expect(body).not.toContain(secret)
    expect(response.headers.get('Cache-Control')).toBe('private, no-store')
  })
  it('does not run AI generation twice for an already processing report', async () => {
    mocks.guest.findOneAndUpdate.mockResolvedValue(null)
    mocks.guest.findOne.mockResolvedValue({ status: 'processing', attempts: 1, generationStartedAt: new Date() })
    expect((await generateReport(request(), context)).status).toBe(202)
    expect(mocks.generate).not.toHaveBeenCalled()
  })
  it('keeps the completed report readable if roadmap generation fails', async () => {
    const doc = { _id: 'report-one', quizType: 'test', answers: {}, attempts: 1, checkpoints: [], toObject() { return { ...this } } }
    mocks.guest.findOneAndUpdate.mockResolvedValue(doc)
    mocks.generate.mockResolvedValue({ reportContent: 'Full report', summary: 'Summary', archetypeTag: 'the creator', userProfile: 'Profile' })
    mocks.generateTimeline.mockRejectedValue(new Error('Provider timeout'))
    const response = await generateReport(request(), context)
    expect(response.status).toBe(200)
    expect(await response.json()).toMatchObject({ status: 'ready', content: 'Full report', timelineError: true })
  })
  it('requires authentication for account saving', async () => {
    expect((await saveReport(request(), context)).status).toBe(401)
    expect(mocks.guest.findOneAndUpdate).not.toHaveBeenCalled()
  })
  it('will not attach a report already claimed by another account', async () => {
    mocks.auth.mockResolvedValue({ user: { id: 'account-two' } })
    mocks.guest.findOneAndUpdate.mockResolvedValue(null)
    expect((await saveReport(request(), context)).status).toBe(409)
    expect(mocks.report.findOneAndUpdate).not.toHaveBeenCalled()
  })
  it('repeated saves reuse one account report and copy its roadmap', async () => {
    mocks.auth.mockResolvedValue({ user: { id: 'account-one' } })
    mocks.guest.findOneAndUpdate.mockResolvedValue({ _id: 'stable-report-id', content: 'Report', checkpoints: [{ year: 2026 }], quizType: 'test' })
    await saveReport(request(), context)
    await saveReport(request(), context)
    expect(mocks.report.findOneAndUpdate.mock.calls.map(call => call[0])).toEqual([
      { _id: 'stable-report-id', userId: 'account-one' }, { _id: 'stable-report-id', userId: 'account-one' },
    ])
    expect(mocks.timeline.findOneAndUpdate).toHaveBeenCalledWith({ reportId: 'stable-report-id', userId: 'account-one' }, expect.anything(), { upsert: true })
  })
  it('emails an account-free link using the configured origin, not the incoming Host', async () => {
    mocks.guest.findOne.mockResolvedValue({ content: 'Report' })
    mocks.send.mockResolvedValue({ data: { id: 'accepted-email' }, error: null })
    expect((await emailReport(request({ email: 'Person@Example.com' }), context)).status).toBe(200)
    expect(mocks.send).toHaveBeenCalledWith(expect.objectContaining({ to: 'person@example.com', text: expect.stringContaining(`https://www.future-u.app/results/${token}`) }))
    expect(mocks.send.mock.calls[0][0].text).not.toContain('untrusted-host')
  })
  it('does not claim success when the email provider rejects delivery', async () => {
    mocks.guest.findOne.mockResolvedValue({ content: 'Report' })
    mocks.send.mockResolvedValue({ error: { message: 'Sender not verified' } })
    expect((await emailReport(request({ email: 'person@example.com' }), context)).status).toBe(502)
  })
  it('rejects invalid email addresses and throttles repeated sending', async () => {
    expect((await emailReport(request({ email: 'invalid' }), context)).status).toBe(400)
    mocks.guest.findOne.mockResolvedValue({ content: 'Report' })
    mocks.allow.mockResolvedValue(false)
    expect((await emailReport(request({ email: 'person@example.com' }), context)).status).toBe(429)
    expect(mocks.send).not.toHaveBeenCalled()
  })
})
