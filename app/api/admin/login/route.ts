import { NextResponse } from 'next/server'
import { verifyCredentials, createToken } from '@/lib/auth'
import { checkRateLimit, cleanupRateLimits } from '@/lib/rate-limit'

export async function POST(request: Request) {
  try {
    // Rate limit by IP
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded?.split(',')[0]?.trim() || 'unknown'

    cleanupRateLimits()
    const { allowed, retryAfterSeconds } = checkRateLimit(ip)

    if (!allowed) {
      return NextResponse.json(
        { error: `Muitas tentativas. Tente novamente em ${retryAfterSeconds} segundos.` },
        { status: 429 }
      )
    }

    const { username, password } = await request.json()

    if (
      typeof username !== 'string' ||
      typeof password !== 'string' ||
      !username ||
      !password
    ) {
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      )
    }

    if (!verifyCredentials(username, password)) {
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      )
    }

    const token = createToken(username)

    const response = NextResponse.json({ success: true })
    response.cookies.set('admin-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 dias
    })

    return response
  } catch {
    return NextResponse.json(
      { error: 'Falha no login' },
      { status: 500 }
    )
  }
}
