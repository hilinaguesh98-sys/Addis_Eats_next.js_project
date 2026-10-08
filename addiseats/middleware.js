import { NextResponse } from 'next/server'
import { SESSION_COOKIE, verifySessionToken } from './lib/session-token'

export async function middleware(request) {
  const token = request.cookies.get(SESSION_COOKIE)?.value
  if (await verifySessionToken(token)) return NextResponse.next()

  const signInUrl = new URL('/signin', request.url)
  signInUrl.searchParams.set('next', `${request.nextUrl.pathname}${request.nextUrl.search}`)
  return NextResponse.redirect(signInUrl)
}

export const config = {
  matcher: [
    '/cart/checkout/:path*',
    '/checkout/:path*',
    '/orders/:path*',
    '/order-confirmation/:path*',
    '/kitchen/:path*'
  ]
}