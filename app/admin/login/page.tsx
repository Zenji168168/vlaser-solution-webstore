import { redirect } from 'next/navigation'
import { ShieldCheck } from 'lucide-react'
import { AdminLoginForm } from './login-form'
import { getCurrentAdminAccess } from '@/lib/admin/auth'

export const dynamic = 'force-dynamic'

export default async function AdminLoginPage() {
  const access = await getCurrentAdminAccess()
  if (access.status === 'granted') redirect('/admin')

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10 text-slate-950">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-md items-center">
        <section className="w-full rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <div className="mb-4 grid size-12 place-items-center rounded-lg bg-slate-950 text-cyan-300">
              <ShieldCheck className="size-6" aria-hidden="true" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-950">Vlaser Admin</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Sign in with an approved administrator account. Access is verified on the server.
            </p>
          </div>
          <AdminLoginForm />
          {access.status === 'denied' && (
            <p className="mt-4 rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800">
              Your account is signed in but is not approved for admin access.
            </p>
          )}
        </section>
      </div>
    </main>
  )
}
