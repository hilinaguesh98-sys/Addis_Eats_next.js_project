import { cookies } from 'next/headers'
import { SESSION_COOKIE, SESSION_MAX_AGE, verifySessionToken } from './session-token'

export { createSessionToken, SESSION_COOKIE, SESSION_MAX_AGE, verifySessionToken } from './session-token'

export function sessionCookieOptions(maxAge = SESSION_MAX_AGE) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge
  }
}

export async function getSession() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value
  return verifySessionToken(token)
}