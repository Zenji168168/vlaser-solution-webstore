'use client'

import { useRef, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { authClient } from '@/lib/auth/client'

const GOOGLE_SIGN_IN_TIMEOUT_MS = 15_000
const GOOGLE_SIGN_IN_ERROR = 'Google sign-in could not start. Please try again.'

function getOAuthUrl(result: unknown) {
  const data = (result as { data?: { url?: unknown } } | null)?.data
  if (typeof data?.url !== 'string') return null
  try {
    const url = new URL(data.url)
    return url.protocol === 'https:' ? url.toString() : null
  } catch {
    return null
  }
}

export function GoogleSignInButton() {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const attemptRef = useRef(0)

  const signInWithGoogle = async () => {
    const attempt = attemptRef.current + 1
    attemptRef.current = attempt
    let navigating = false
    setPending(true)
    setError('')

    const timeout = window.setTimeout(() => {
      if (attemptRef.current !== attempt || navigating) return
      setPending(false)
      setError(GOOGLE_SIGN_IN_ERROR)
    }, GOOGLE_SIGN_IN_TIMEOUT_MS)

    try {
      const result = await authClient.signIn.social({
        provider: 'google',
        callbackURL: `${window.location.origin}/admin/auth/callback`,
        errorCallbackURL: `${window.location.origin}/admin/login?error=oauth`,
      })
      const oauthUrl = getOAuthUrl(result)

      if (oauthUrl) {
        navigating = true
        window.location.assign(oauthUrl)
        return
      }

      if (result?.error && attemptRef.current === attempt) {
        setError(GOOGLE_SIGN_IN_ERROR)
      }
    } catch {
      if (attemptRef.current === attempt) {
        setError(GOOGLE_SIGN_IN_ERROR)
      }
    } finally {
      window.clearTimeout(timeout)
      if (!navigating && attemptRef.current === attempt) {
        setPending(false)
      }
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
