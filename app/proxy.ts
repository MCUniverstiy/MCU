import { updateSession } from '@/lib/supabase/middleware'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export async function proxy(request: NextRequest) {
  const response = await updateSession(request)

  const { pathname } = request.nextUrl
  const protectedPaths = ['/dashboard', '/profile']
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p))

  if (isProtected) {
    const sessionCookie = request.cookies.get('sb-xvyowsrqbkjmlilctthm-auth-token')
    if (!sessionCookie) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}