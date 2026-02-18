import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// ATENÇÃO ALAN: Muda esses valores depois!
const ADMIN_USERS = [
  { username: 'admin', password: 'radiohub2025' },
  { username: 'alan', password: 'radiohub123' },
]

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    // Verifica credenciais
    const user = ADMIN_USERS.find(
      u => u.username === username && u.password === password
    )

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Cria token simples (você pode melhorar depois com JWT)
    const token = Buffer.from(`${username}:${Date.now()}`).toString('base64')

    // Seta cookie
    const response = NextResponse.json({ success: true })
    response.cookies.set('admin-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 dias
    })

    return response
  } catch (error) {
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    )
  }
}
