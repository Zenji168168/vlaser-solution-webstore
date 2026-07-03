'use server'

import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth/server'
import { clearAdminCookieHint } from '@/lib/admin/auth'

export interface LoginState {
  error?: string
}

export interface PasswordSetupState {
  message?: string
  error?: string
}

export async function signInAdmin(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get('email') || '').trim().toLowerCase()
  const password = String(formData.get('password') || '')

  if (!email || !password) {
    return { error: 'Enter your administrator email and password.' }
  }

  const { error } = await auth.signIn.email({ email, password })
  if (error) {
    return { error: 'Unable to sign in with those credentials.' }
  }

  redirect('/admin')
}

export async function signOutAdmin() {
  await clearAdminCookieHint()
  await auth.signOut()
  redirect('/admin/login')
}

export async function requestAdminPasswordSetup(): Promise<PasswordSetupState> {
  const email = process.env.ADMIN_ONBOARDING_EMAIL
  if (!email) {
    return { error: 'Password setup is not configured for this Preview.' }
  }

  const { error } = await auth.requestPasswordReset({
    email,
    redirectTo: '/admin/login',
  })

  if (error) {
    return { error: 'Password setup email could not be sent yet.' }
  }

  return { message: 'If this admin account exists, a password setup email has been sent.' }
}
