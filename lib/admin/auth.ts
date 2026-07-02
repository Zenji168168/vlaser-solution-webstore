import 'server-only'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth/server'
import { getAdminUserByAuthIdentity, type AdminUser } from '@/lib/admin/repository'

export type AdminAccess =
  | { status: 'unauthenticated'; session: null; admin: null }
  | { status: 'denied'; session: AdminSession; admin: AdminUser | null }
  | { status: 'granted'; session: AdminSession; admin: AdminUser }

export interface AdminSession {
  user: {
    id: string
    email: string
    name?: string | null
  }
}

function asAdminSession(value: unknown): AdminSession | null {
  const session = value as { user?: { id?: unknown; email?: unknown; name?: unknown } } | null
  const user = session?.user
  const id = user?.id
  const email = user?.email
  if (typeof id !== 'string' || typeof email !== 'string') return null
  return {
    user: {
      id,
      email,
      name: typeof user?.name === 'string' ? user.name : null,
    },
  }
}

export function evaluateAdminAccess(session: AdminSession | null, admin: AdminUser | null): AdminAccess {
  if (!session) return { status: 'unauthenticated', session: null, admin: null }
  if (!admin || !admin.active || admin.role !== 'admin') return { status: 'denied', session, admin }
  return { status: 'granted', session, admin }
}

export async function getCurrentAdminAccess(): Promise<AdminAccess> {
  const { data } = await auth.getSession()
  const session = asAdminSession(data)
  if (!session) return evaluateAdminAccess(null, null)

  const admin = await getAdminUserByAuthIdentity(session.user.id, session.user.email)
  return evaluateAdminAccess(session, admin)
}

export async function requireAdmin(): Promise<Extract<AdminAccess, { status: 'granted' }>> {
  const access = await getCurrentAdminAccess()
  if (access.status === 'unauthenticated') redirect('/admin/login')
  if (access.status === 'denied') redirect('/admin/denied')
  return access
}

export async function clearAdminCookieHint() {
  const cookieStore = await cookies()
  cookieStore.delete('vlaser_admin_hint')
}
