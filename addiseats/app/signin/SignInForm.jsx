'use client'

import { useState } from 'react'

export default function SignInForm({ requestedNext }) {
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  async function submit(event) {
    event.preventDefault()
    setError('')
    setPending(true)

    const form = new FormData(event.currentTarget)
    const response = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: form.get('email'),
        password: form.get('password'),
        next: form.get('next')
      })
    })
    const result = await response.json()

    if (!response.ok) {
      setError(result.error || 'Unable to sign in.')
      setPending(false)
      return
    }

    window.location.assign(result.redirectTo)
  }

  return <form className="auth-form" onSubmit={submit}>
    {error ? <p className="error-box" role="alert">{error}</p> : null}
    <label>Email<input name="email" type="email" autoComplete="username" required/></label>
    <label>Password<input name="password" type="password" autoComplete="current-password" required/></label>
    <input name="next" type="hidden" value={requestedNext}/>
    <button className="checkout-button full" disabled={pending}>{pending ? 'Signing in...' : 'Sign in'}</button>
  </form>
}