import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  // Verificación básica de sesión desde las cookies de Supabase
  const token = req.cookies.get('sb-access-token')?.value || req.cookies.get('sb-localhost-auth-token')?.value

  const isLoginPage = req.nextUrl.pathname === '/admin/login'
  const isAdminRoute = req.nextUrl.pathname.startsWith('/admin')

  // Si intenta acceder a /admin sin estar en login y sin token, redirige al login
  if (isAdminRoute && !isLoginPage && !token) {
    return NextResponse.redirect(new URL('/admin/login', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}