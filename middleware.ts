import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin')
  const isLoginPage = request.nextUrl.pathname === '/admin/feijaoxlogin'
  const token = request.cookies.get('admin-token')?.value

  // Se está tentando acessar admin sem estar logado
  if (isAdminRoute && !isLoginPage && !token) {
    return NextResponse.redirect(new URL('/admin/feijaoxlogin', request.url))
  }

  // Se está logado e tenta acessar login, redireciona pro dashboard
  if (isLoginPage && token) {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/admin/:path*',
}
