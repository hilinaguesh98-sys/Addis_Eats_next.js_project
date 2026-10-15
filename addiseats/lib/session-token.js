const SESSION_COOKIE = 'addis_eats_session'
export const SESSION_MAX_AGE = 60*60*24
const encoder = new TextEncoder()

function getSecret() {
  if (process.env.AUTH_SECRET) return process.env.AUTH_SECRET
  if (process.env.NODE_ENV === 'production') {
    throw new Error('AUTH_SECRET must be configured in production.')
  }
  return 'development-only-addiseats-session-secret'
}

function encodeBase64Url(value) {
  const bytes = encoder.encode(value)
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function decodeBase64Url(value) {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/')
  const binary = atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '='))
  return Uint8Array.from(binary, (character) => character.charCodeAt(0))
}

async function importSigningKey() {
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(getSecret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  )
}

export { SESSION_COOKIE }

export async function createSessionToken(user) {
  const payload = encodeBase64Url(JSON.stringify({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE
  }))
  const key = await importSigningKey()
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(payload))
  const signatureBytes = new Uint8Array(signature)
  let binary = ''
  for (const byte of signatureBytes) binary += String.fromCharCode(byte)
  const encodedSignature = btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
  return `${payload}.${encodedSignature}`
}

export async function verifySessionToken(token) {
  if (typeof token !== 'string') return null

  try {
    const [payload, signature, extra] = token.split('.')
    if (!payload || !signature || extra) return null
    const key = await importSigningKey()
    const valid = await crypto.subtle.verify(
      'HMAC',
      key,
      decodeBase64Url(signature),
      encoder.encode(payload)
    )
    if (!valid) return null

    const session = JSON.parse(new TextDecoder().decode(decodeBase64Url(payload)))
    if (!session.id || !session.name || !session.email || !['customer', 'staff'].includes(session.role)) return null
    if (!Number.isInteger(session.exp) || session.exp <= Math.floor(Date.now() / 1000)) return null

    return { id: session.id, name: session.name, email: session.email, role: session.role }
  } catch {
    return null
  }
}

export function getSafeNext(value) {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//') || value.includes('\\')) {
    return null
  }

  try {
    const destination = new URL(value, 'https://addiseats.invalid')
    if (destination.origin !== 'https://addiseats.invalid' || destination.pathname === '/signin') return null
    return `${destination.pathname}${destination.search}${destination.hash}`
  } catch {
    return null
  }
}