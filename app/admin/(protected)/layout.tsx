import { AdminShell } from '@/components/admin-shell'
import { requireAdmin } from '@/lib/admin/auth'

export const dynamic = 'force-dynamic'

export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  const { admin, session } = await requireAdmin()
  return (
    <AdminShell adminName={admin.displayName || session.user.name || admin.email}>
      {children}
    </AdminShell>
  )
}
