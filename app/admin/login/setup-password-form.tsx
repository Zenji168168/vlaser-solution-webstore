'use client'

import { useActionState } from 'react'
import { KeyRound } from 'lucide-react'
import { requestAdminPasswordSetup, type PasswordSetupState } from '@/app/admin/actions'

export function SetupPasswordForm() {
  const [state, formAction, pending] = useActionState<PasswordSetupState, FormData>(requestAdminPasswordSetup, {})

  return (
    <form action={formAction} className="mt-4 border-t border-slate-100 pt-4">
      <button type="submit" disabled={pending} className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-ring disabled:opacity-60">
        <KeyRound className="size-4" aria-hidden="true" />
        {pending ? 'Sending setup email...' : 'Forgot password? Set up password'}
      </button>
      {state.message && (
        <p className="mt-3 rounded-lg border border-cyan-100 bg-cyan-50 px-3 py-2 text-sm font-medium text-cyan-900" role="status">
          {state.message}
        </p>
      )}
      {state.error && (
        <p className="mt-3 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm font-medium text-red-700" role="alert">
          {state.error}
        </p>
      )}
    </form>
  )
}
