import crypto from 'crypto'

// --- Credential verification ---

interface AdminUser {
  username: string
  password: string
}

function getAdminUsers(): AdminUser[] {
  const raw = process.env.ADMIN_CREDENTIALS
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (u: any) =>
        typeof u.username === 'string' &&
        typeof u.password === 'string' &&
        u.username.length > 0 &&
        u.password.length > 0
    )
  } catch {
    return []
  }
}

function timingSafeCompare(a: string, b: string): boolean {
  // Pad to same length to avoid length-leaking timing differences
  const maxLen = Math.max(a.length, b.length)
  const bufA = Buffer.alloc(maxLen)
  const bufB = Buffer.alloc(maxLen)
  bufA.write(a)
  bufB.write(b)
  const equal = crypto.timingSafeEqual(bufA, bufB)
  // Also check actual length match
  return equal && a.length === b.length
}

export function verifyCredentials(username: string, password: string): boolean {
  const users = getAdminUsers()
  if (users.length === 0) return false

  let found = false
  for (const user of users) {
    if (timingSafeCompare(user.username, username) && timingSafeCompare(user.password, password)) {
      found = true
    }
  }
  return found
}

// --- HMAC token signing & verification ---

function getTokenSecret(): string {
  const secret = process.env.ADMIN_TOKEN_SECRET
  if (!secret || secret.length < 32) {
    throw new Error('ADMIN_TOKEN_SECRET must be set and at least 32 characters')
  }
  return secret
}

const TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

export function createToken(username: string): string {
  const secret = getTokenSecret()
  const expiry = Date.now() + TOKEN_EXPIRY_MS
  const payload = `${username}:${expiry}`
  const hmac = crypto.createHmac('sha256', secret).update(payload).digest('hex')
  return Buffer.from(`${payload}:${hmac}`).toString('base64')
}

export function verifyToken(token: string): { valid: boolean; username?: string } {
  try {
    const secret = getTokenSecret()
    const decoded = Buffer.from(token, 'base64').toString('utf-8')
    const parts = decoded.split(':')

    if (parts.length !== 3) return { valid: false }

    const [username, expiryStr, receivedHmac] = parts
    const expiry = parseInt(expiryStr, 10)

    if (isNaN(expiry) || Date.now() > expiry) return { valid: false }

    const expectedPayload = `${username}:${expiryStr}`
    const expectedHmac = crypto.createHmac('sha256', secret).update(expectedPayload).digest('hex')

    if (!timingSafeCompare(receivedHmac, expectedHmac)) return { valid: false }

    return { valid: true, username }
  } catch {
    return { valid: false }
  }
}
