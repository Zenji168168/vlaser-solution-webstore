'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { authClient } from '@/lib/auth/client'

export default function AdminAuthCallbackPage() {
  const [message, setMessage] = useState('Completing Google sign-in...')

  useEffect(() => {
    let active = true

    async function finishSignIn() {
      try {
        const result = await authClient.getSession()
        if (!active) return
        if (result?.data) {
          window.location.replace('/admin')
          return
        }
        setMessage('Google sign-in could not be completed.')
        window.location.replace('/admin/login?error=oauth')
      } catch {
        if (!active) return
        setMessage('Google sign-in could not be completed.')
        window.location.replace('/admin/login?error=oauth')
      }
    }

    finishSignIn()
    return () => {
      active = false
    }
  }, [])

  return (
    <main className="grid min-h-screen place-items-center bg-slate-100 px-4 text-slate-950">
      <section className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-6 text-center shadow-sm">
        <Loader2 className="mx-auto size-6 animate-spin text-slate-700" aria-hidden="true" />
        <h1 className="mt-4 text-lg font-black">Vlaser Admin</h1>
        <p className="mt-2 text-sm font-medium text-slate-600">{message}</p>
      </section>
    </main>
  )
}
