import { createHash } from 'crypto'
import { RequestLimit } from '@/models/RequestLimit'

export function requestAddress(request: Request): string {
  return request.headers.get('x-real-ip') || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
}

// MongoDB keeps the counter consistent across serverless instances.
export async function allowRequest(key: string, maximum: number, windowMs = 3_600_000): Promise<boolean> {
  const bucket = Math.floor(Date.now() / windowMs)
  const id = createHash('sha256').update(`${key}:${bucket}`).digest('hex')
  const result = await RequestLimit.findOneAndUpdate(
    { _id: id },
    { $inc: { count: 1 }, $setOnInsert: { expiresAt: new Date((bucket + 2) * windowMs) } },
    { upsert: true, new: true }
  )
  return result.count <= maximum
}
