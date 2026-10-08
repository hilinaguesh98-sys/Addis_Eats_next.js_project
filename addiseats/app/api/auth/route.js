import { NextResponse } from 'next/server'
import { authenticateUser } from '../../../lib/users'
import { createSessionToken, getSession, SESSION_COOKIE, sessionCookieOptions } from '../../../lib/session'
import { getSafeNext } from '../../../lib/session-token'

export async function GET() {
    return NextResponse.json({ user: await getSession() })
}

export async function POST(request) {
    const body = await request.json().catch(() => null)
    if (!body || typeof body !== 'object') {
        return NextResponse.json({ error: 'Invalid sign-in request.' }, { status: 400 })
    }

    const next = body.next === undefined ? '/orders' : getSafeNext(body.next) || '/'

    const user = authenticateUser(body.email, body.password)
    if (!user) return NextResponse.json({ error: 'Email or password is incorrect.' }, { status: 401 })

    try {
        const response = NextResponse.json({ ok: true, redirectTo: next })
        response.cookies.set(SESSION_COOKIE, await createSessionToken(user), sessionCookieOptions())
        return response
    } catch {
        return NextResponse.json({ error: 'Sign-in is not configured on this server.' }, { status: 500 })
    }
}

export async function DELETE() {
    const response = NextResponse.json({ ok: true })
    response.cookies.set(SESSION_COOKIE, '', sessionCookieOptions(0))
    return response
}
