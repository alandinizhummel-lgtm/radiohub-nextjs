// Simple in-memory rate limiter for serverless (resets on cold start, good enough for brute force protection)
const attempts = new Map<string, { count: number; resetAt: number }>()

const MAX_ATTEMPTS = 5
const WINDOW_MS = 15 * 60 * 1000 // 15 minutes

export function checkRateLimit(ip: string): { allowed: boolean; retryAfterSeconds?: number } {
  const now = Date.now()
  const entry = attempts.get(ip)

  // Clean expired entry
  if (entry && now > entry.resetAt) {
    attempts.delete(ip)
  }

  const current = attempts.get(ip)

  if (!current) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return { allowed: true }
  }

  if (current.count >= MAX_ATTEMPTS) {
    const retryAfterSeconds = Math.ceil((current.resetAt - now) / 1000)
    return { allowed: false, retryAfterSeconds }
  }

  current.count++
  return { allowed: true }
}

// Periodically clean old entries to prevent memory leak (every 100 calls)
let cleanupCounter = 0
export function cleanupRateLimits() {
  cleanupCounter++
  if (cleanupCounter < 100) return
  cleanupCounter = 0
  const now = Date.now()
  for (const [key, entry] of attempts) {
    if (now > entry.resetAt) attempts.delete(key)
  }
}
