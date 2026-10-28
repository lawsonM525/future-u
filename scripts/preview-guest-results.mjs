// Disposable local data for reviewing the guest page. Never uses production credentials.
import { MongoMemoryServer } from 'mongodb-memory-server'
import { MongoClient } from 'mongodb'
import { createHash } from 'node:crypto'

const server = await MongoMemoryServer.create({ instance: { port: 27099, dbName: 'future_u_verification' } })
const client = await MongoClient.connect(server.getUri())
const token = 'a'.repeat(64)
await client.db('future_u_verification').collection('guestreports').insertOne({
  tokenHash: createHash('sha256').update(token).digest('hex'),
  status: 'ready', quizType: 'quickie', answers: { 1: 'Fictional local preview' }, attempts: 1,
  content: '## CURRENT STRENGTHS & TALENTS\n\nClear communication\nYou explain ideas clearly and connect research to practical projects.\n\nThoughtful design\nYou turn user interviews into accessible prototypes.\n\n## STRATEGIES FOR GROWTH\n\nBuild your portfolio\n- Complete one education technology design project.\n- Ask an experienced designer for feedback.\n\nDevelop your skills\n- Practice interaction design with a working prototype.\n- Document what you learn from usability testing.',
  summary: 'You are an aspiring product designer with experience in communication and user research. Your goal is to build useful education technology over the next five years.',
  checkpoints: Array.from({ length: 6 }, (_, index) => ({ year: new Date().getUTCFullYear() + index, title: index ? 'Develop your expertise' : 'Build your portfolio', description: 'Make steady progress through practical projects and feedback.', items: ['Completed a portfolio project', 'Documented your design decisions', 'Received feedback from an experienced designer'] })),
  createdAt: new Date(), userId: null, timelineError: false,
})
console.log(`Local fixture ready: http://localhost:3107/results/${token}`)
console.log('This process keeps a disposable MongoDB database running. Press Ctrl-C to remove it.')
process.on('SIGINT', async () => { await client.close(); await server.stop(); process.exit(0) })
process.on('SIGTERM', async () => { await client.close(); await server.stop(); process.exit(0) })
await new Promise(() => {})
