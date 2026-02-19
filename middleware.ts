import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const isAdminPage = pathname.startsWith('/admin')
  const isAdminApi = pathname.startsWith('/api/admin')
  const isLoginPage = pathname === '/admin/feijaoxlogin'
  const isLoginApi = pathname === '/api/admin/login'
  const token = request.cookies.get('admin-token')?.value

  // Protege rotas de API admin (exceto login)
  if (isAdminApi && !isLoginApi) {
    if (!token) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Verifica token HMAC no middleware (verificação leve)
    try {
      const decoded = Buffer.from(token, 'base64').toString('utf-8')
      const parts = decoded.split(':')
      if (parts.length !== 3) {
        return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
      }
      const expiry = parseInt(parts[1], 10)
      if (isNaN(expiry) || Date.now() > expiry) {
        return NextResponse.json({ error: 'Token expirado' }, { status: 401 })
      }
      // A verificação completa do HMAC é feita no verifyToken() nas rotas
    } catch {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    return NextResponse.next()
  }

  // Se está tentando acessar admin sem estar logado
  if (isAdminPage && !isLoginPage && !token) {
    return NextResponse.redirect(new URL('/admin/feijaoxlogin', request.url))
  }

  // Se está logado e tenta acessar login, redireciona pro dashboard
  if (isLoginPage && token) {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
