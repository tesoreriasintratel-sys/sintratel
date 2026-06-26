import { NextResponse, type NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const isAdminPath = request.nextUrl.pathname.startsWith('/admin')
  const isLoginPath = request.nextUrl.pathname === '/admin/login'

  const token = request.cookies.get('sintratel_token')?.value
  const secret = process.env.ADMIN_TOKEN_SECRET
  const isAuthenticated = !!token && !!secret && token === secret

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
