import { createHash, randomBytes } from 'crypto'

export function newReportToken(): string {
  return randomBytes(32).toString('hex')
}

export function hashReportToken(token: string): string | null {
  if (!/^[a-f0-9]{64}$/.test(token)) return null
  return createHash('sha256').update(token).digest('hex')
}

export function normalizeEmail(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const email = value.trim().toLowerCase()
  return email.length <= 254 && /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email) ? email : null
}

export const privateReportHeaders = {
  'Cache-Control': 'private, no-store',
  'Referrer-Policy': 'no-referrer',
  'X-Robots-Tag': 'noindex, nofollow, noarchive',
}
