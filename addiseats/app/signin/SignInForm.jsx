'use client'

import { useEffect, useRef, useState } from 'react'

export default function SignInForm({ requestedNext, googleClientId }) {
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const submitGuard = useRef(false)
  const googleButton = useRef(null)

  useEffect(() => {
    if (!googleClientId || !googleButton.current) return undefined

    let active = true
    let script = document.querySelector('#google-identity-services')
    const nonce = crypto.randomUUID()
    const renderGoogleButton = () => {
      if (!active || !window.google?.accounts?.id || !googleButton.current) return
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        nonce,
        callback: async ({ credential }) => {
          setError('')
          setPending(true)
          try {
            const response = await fetch('/api/auth/google', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ credential, next: requestedNext, nonce }),
            })
            const result = await response.json()
            if (!response.ok) {
              setError(result.error || 'Unable to sign in with Google.')
              return
            }
            window.location.assign(result.redirectTo)
          } catch {
            setError('Google sign-in could not be completed. Please check your connection and try again.')
          } finally {
            setPending(false)
          }
        },
      })
      window.google.accounts.id.renderButton(googleButton.current, {
        theme: 'outline',
        size: 'large',
        text: 'continue_with',
        shape: 'rectangular',
        width: 320,
      })
    }

    if (window.google?.accounts?.id) {
      renderGoogleButton()
    } else {
      if (!script) {
        script = document.createElement('script')
        script.id = 'google-identity-services'
        script.src = 'https://accounts.google.com/gsi/client'
        script.async = true
        script.defer = true
        document.head.appendChild(script)
      }
      script.addEventListener('load', renderGoogleButton)
      script.addEventListener('error', () => {
        if (active) setError('Google sign-in is unavailable. Please try again later.')
      }, { once: true })
    }

    return () => {
      active = false
      script?.removeEventListener('load', renderGoogleButton)
    }
  }, [googleClientId, requestedNext])

  async function submit(event) {
    event.preventDefault()
    if (submitGuard.current) return
    submitGuard.current = true
    setError('')
    setPending(true)

    try {
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
        return
      }

      window.location.assign(result.redirectTo)
    } catch {
      setError('Sign in could not be completed. Please check your connection and try again.')
    } finally {
      setPending(false)
      submitGuard.current = false
    }
  }

  return <>
    {error && <p className="error-box auth-error has-error" role="alert">{error}</p>}
    {googleClientId && <>
      <div className="google-signin-button" ref={googleButton} aria-label="Continue with Google" />
      <p className="auth-divider">or sign in with email</p>
    </>}
    <form className="auth-form" onSubmit={submit}>
      <label>Email<input name="email" type="email" autoComplete="username" required/></label>
      <label>Password<input name="password" type="password" autoComplete="current-password" required/></label>
      <input name="next" type="hidden" value={requestedNext}/>
      <button className="checkout-button full" disabled={pending}>{pending ? 'Signing in...' : 'Sign in'}</button>
    </form>
  </>
}