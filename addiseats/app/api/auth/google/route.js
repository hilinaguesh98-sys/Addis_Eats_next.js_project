import { createPublicKey, verify } from 'node:crypto'
import { NextResponse } from 'next/server'
import { createSessionToken, SESSION_COOKIE, sessionCookieOptions } from '../../../../lib/session'
import { getSafeNext } from '../../../../lib/session-token'

export const runtime = 'nodejs'

let signingKeys
let signingKeysExpiresAt = 0
let signingKeysRefreshedAt = 0

function getGoogleClientId() {
  return process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
}

async function getGoogleSigningKey(keyId) {
  const now = Date.now()
  if (signingKeys && now < signingKeysExpiresAt) {
    const cachedKey = signingKeys.find((key) => key.kid === keyId)
    if (cachedKey) return cachedKey
    if (now - signingKeysRefreshedAt < 5 * 60 * 1000) return null
  }

  const response = await fetch('https://www.googleapis.com/oauth2/v3/certs', { cache: 'no-store' })
  if (!response.ok) throw new Error('Google signing keys are temporarily unavailable.')
  const result = await response.json()
  if (!Array.isArray(result.keys)) throw new Error('Google returned invalid signing keys.')

  signingKeys = result.keys
  signingKeysExpiresAt = now + 60 * 60 * 24
  signingKeysRefreshedAt = now
  return signingKeys.find((key) => key.kid === keyId) || null
}

async function verifyGoogleCredential(credential, nonce) {
  const parts = credential.split('.')
  if (parts.length !== 3) return null

  let header
  let claims
  try {
    header = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8'))
    claims = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'))
  } catch {
    return null
  }

  if (!header || typeof header !== 'object' || !claims || typeof claims !== 'object'
    || header.alg !== 'RS256' || typeof header.kid !== 'string' || header.kid.length > 256) return null
  const googleClientId = getGoogleClientId()
  if (typeof googleClientId !== 'string') return null
  const key = await getGoogleSigningKey(header.kid)
 
  if (!key) return null

  const publicKey = createPublicKey({ key, format: 'jwk' })
  let validSignature = false
  try {
    validSignature = verify(
      'RSA-SHA256',
      Buffer.from(`${parts[0]}.${parts[1]}`),
      publicKey,
      Buffer.from(parts[2], 'base64url'),
    )
  } catch {
    return null
  }
  const now = Math.floor(Date.now() / 1000)

  if (!validSignature
    || !['accounts.google.com', 'https://accounts.google.com'].includes(claims.iss)
    || claims.aud !== googleClientId
    || typeof nonce !== 'string'
    || claims.nonce !== nonce
    // || !Number.isInteger(claims.exp)
    // || claims.exp <= now
    // || !Number.isInteger(claims.iat)
    // || claims.iat > now + 60
    || typeof claims.sub !== 'string' || claims.sub.length > 255
    || !claims.sub
    || typeof claims.email !== 'string' || claims.email.length > 320
    || !claims.email
    || claims.email_verified !== true) return null


  

  return {
    id: `google:${claims.sub}`,
    name: typeof claims.name === 'string' && claims.name.trim() ? claims.name.trim() : claims.email,
    email: claims.email.trim().toLowerCase(),
    role: 'customer',
  }
}

export async function POST(request) {
  if (!getGoogleClientId()) {
    return NextResponse.json({ error: 'Google sign-in is not configured.' }, { status: 503 })
  }
  if (request.headers.get('origin') !== new URL(request.url).origin) {
    return NextResponse.json({ error: 'Invalid Google sign-in request origin.' }, { status: 403 })
  }

  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid Google sign-in request.' }, { status: 400 })
  }
  if (!body || typeof body.credential !== 'string' || body.credential.length > 8192
    || typeof body.nonce !== 'string' || body.nonce.length > 128) {
    return NextResponse.json({ error: 'Invalid Google sign-in request.' }, { status: 400 })
  }

  try {
    const user = await verifyGoogleCredential(body.credential, body.nonce)
    if (!user) return NextResponse.json({ error: 'Google sign-in could not be verified.' }, { status: 401 })

    const next = body.next === undefined ? '/orders' : getSafeNext(body.next) || '/'
    const response = NextResponse.json({ ok: true, redirectTo: next })
    response.cookies.set(SESSION_COOKIE, await createSessionToken(user), sessionCookieOptions())
    return response
  } catch {
    return NextResponse.json({ error: 'Google sign-in is temporarily unavailable. Please try again.' }, { status: 503 })
  }
}
