'use client'

import { useActionState } from 'react'
import { LockKeyhole, Mail } from 'lucide-react'
import { signInAdmin, type LoginState } from '@/app/admin/actions'

export function AdminLoginForm() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(signInAdmin, {})

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-slate-800">Email</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input id="email" name="email" type="email" autoComplete="email" required className="input-field h-11 rounded-lg pl-10" />
        </div>
      </div>
      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-semibold text-slate-800">Password</label>
        <div className="relative">
          <LockKeyhole className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input id="password" name="password" type="password" autoComplete="current-password" required className="input-field h-11 rounded-lg pl-10" />
        </div>
      </div>
      {state.error && (
        <p className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm font-medium text-red-700" role="alert">
          {state.error}
        </p>
      )}
      <button type="submit" disabled={pending} className="btn-primary h-11 w-full rounded-lg bg-slate-950 hover:bg-slate-800">
        {pending ? 'Signing in...' : 'Sign in'}
      </button>
    </form>
  )
}
