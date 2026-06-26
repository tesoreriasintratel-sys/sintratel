import { NextResponse, type NextRequest } from 'next/server'

function decodeJWTPayload(token: string) {
  try {
    const base64url = token.split('.')[1]
    const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(atob(base64))
  } catch {
    return null
  }
}

export function middleware(request: NextRequest) {
  const isAdminPath = request.nextUrl.pathname.startsWith('/admin')
  const isLoginPath = request.nextUrl.pathname === '/admin/login'

  const token = request.cookies.get('sintratel_token')?.value
  let isAuthenticated = false

  if (token) {
    const payload = decodeJWTPayload(token)
    isAuthenticated = !!payload && payload.exp > Math.floor(Date.now() / 1000)
  }

  if (isAdminPath && !isLoginPath && !isAuthenticated) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  if (isLoginPath && isAuthenticated) {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
