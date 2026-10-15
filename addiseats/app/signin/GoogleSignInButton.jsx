
'use client'

import { signIn } from 'next-auth/react'

export default function GoogleSignInButton() {
  return (
    <button
      type="button"
      onClick={() => signIn('google', { callbackUrl: '/menu' })}
      className="w-full rounded-lg border border-gray-300 px-4 py-3 font-medium hover:bg-gray-50"
    >
      Continue with Google
    </button>
  )
}
