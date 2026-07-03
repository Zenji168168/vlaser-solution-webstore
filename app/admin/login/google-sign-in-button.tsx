'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { authClient } from '@/lib/auth/client'

export function GoogleSignInButton() {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')

  const signInWithGoogle = async () => {
    setPending(true)
    setError('')
    const { error } = await authClient.signIn.social({
      provider: 'google',
      callbackURL: '/admin',
      errorCallbackURL: '/admin/login?error=oauth',
    })

    if (error) {
      setPending(false)
      setError('Google sign-in could not start. Try again.')
    }
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={signInWithGoogle}
        disabled={pending}
        className="inline-flex min-h-11 w-full items-center justify-center gap-3 rounded-lg border border-slate-300 bg-white px-4 text-sm font-bold text-slate-900 shadow-sm hover:bg-slate-50 focus-ring disabled:opacity-60"
      >
        {pending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <span className="text-base font-black" aria-hidden="true">G</span>}
        Continue with Google
      </button>
      {error && (
        <p className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm font-medium text-red-700" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
