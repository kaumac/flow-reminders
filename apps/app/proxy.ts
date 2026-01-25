import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
 
export function proxy(request: NextRequest) {
  const token = request.cookies.get('session_token')?.value
  
  const authRoutes = ['/signin', '/signup'];
  const isAuthRoute = authRoutes.some(path => request.nextUrl.pathname.startsWith(path));

  // 1. Redirect guests to sign-in if they try to access ANY protected route
  if (!token && !isAuthRoute) {
    return NextResponse.redirect(new URL('/signin', request.url))
  }

  // 2. Redirect logged-in users away from auth pages
  if (token && isAuthRoute) {
    return NextResponse.redirect(new URL('/', request.url))
  }
 
  return NextResponse.next()
}
 
export const config = {
  matcher: [
    /*
     * Match all request paths except for technical internals.
     * This is the performant way to whitelist these paths.
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}