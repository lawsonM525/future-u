import { afterAll, beforeAll, beforeEach, expect, it, vi } from 'vitest'
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'

const { auth } = vi.hoisted(() => ({ auth: vi.fn() }))
vi.mock('@/app/utils/authOptions', () => ({ auth }))
vi.mock('@/lib/mongodb', () => ({ connect: async () => mongoose }))
import { GuestReport } from '../../models/GuestReport'
import { Report } from '../../models/Report'
import { Timeline } from '../../models/Timeline'
import { RequestLimit } from '../../models/RequestLimit'
import { hashReportToken } from '../../lib/guest-report-access'
import { allowRequest } from '../../lib/request-limit'
import { POST as save } from '../../app/api/guest-reports/[token]/save/route'

let database: MongoMemoryServer
const token = 'a'.repeat(64)
const context = { params: { token } }
const request = () => new Request('http://localhost/api', { method: 'POST' })

beforeAll(async () => {
  database = await MongoMemoryServer.create()
  await mongoose.connect(database.getUri('future_u_tests'))
  await Promise.all([GuestReport.init(), Report.init(), Timeline.init(), RequestLimit.init()])
}, 120_000)

beforeEach(async () => {
  vi.resetAllMocks()
  await Promise.all([GuestReport.deleteMany({}), Report.deleteMany({}), Timeline.deleteMany({}), RequestLimit.deleteMany({})])
})

afterAll(async () => { await mongoose.disconnect(); await database?.stop() })

async function seed() {
  return GuestReport.create({ tokenHash: hashReportToken(token), status: 'ready', quizType: 'test', answers: { 1: 'Private' }, content: 'A complete strategy', checkpoints: [{ year: 2026, title: 'Build a portfolio', items: ['Complete a project'] }] })
}

it('enforces rate limits across concurrent server instances', async () => {
  const allowed = await Promise.all(Array.from({ length: 10 }, () => allowRequest('shared-address', 3)))
  expect(allowed.filter(Boolean)).toHaveLength(3)
  expect(await RequestLimit.countDocuments()).toBe(1)
})

it('saves one report and one roadmap when OAuth callbacks arrive concurrently', async () => {
  await seed()
  auth.mockResolvedValue({ user: { id: 'owner' } })
  const responses = await Promise.all([save(request(), context), save(request(), context)])
  expect(responses.map(response => response.status)).toEqual([200, 200])
  expect(await Report.countDocuments({ userId: 'owner' })).toBe(1)
  expect(await Timeline.countDocuments({ userId: 'owner' })).toBe(1)
})

it('allows only one account to claim a private report, even in a race', async () => {
  await seed()
  auth.mockResolvedValueOnce({ user: { id: 'owner-one' } }).mockResolvedValueOnce({ user: { id: 'owner-two' } })
  const responses = await Promise.all([save(request(), context), save(request(), context)])
  expect(responses.map(response => response.status).sort()).toEqual([200, 409])
  const claimed = await GuestReport.findOne({ tokenHash: hashReportToken(token) })
  expect(await Report.countDocuments()).toBe(1)
  expect((await Report.findOne())?.userId).toBe(claimed.userId)
})
