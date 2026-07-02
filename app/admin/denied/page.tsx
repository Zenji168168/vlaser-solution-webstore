import Link from 'next/link'
import { ShieldAlert } from 'lucide-react'
import { getCurrentAdminAccess } from '@/lib/admin/auth'
import { signOutAdmin } from '@/app/admin/actions'

export const dynamic = 'force-dynamic'

export default async function AdminDeniedPage() {
  const access = await getCurrentAdminAccess()

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10 text-slate-950">
      <section className="mx-auto mt-16 max-w-lg rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 grid size-12 place-items-center rounded-lg bg-amber-50 text-amber-700">
          <ShieldAlert className="size-6" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-black">Admin access not approved</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          This signed-in account is not active with the admin role. Ask an existing project owner to approve the account in the database-backed admin role table.
        </p>
        {access.session?.user.email && <p className="mt-3 text-sm font-semibold text-slate-800">{access.session.user.email}</p>}
        <div className="mt-6 flex flex-wrap gap-3">
          <form action={signOutAdmin}>
            <button type="submit" className="btn-primary rounded-lg bg-slate-950 hover:bg-slate-800">Sign out</button>
          </form>
          <Link href="/" className="btn-secondary rounded-lg">View Store</Link>
        </div>
      </section>
    </main>
  )
}
