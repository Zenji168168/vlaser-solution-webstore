import Link from 'next/link'
import { AlertTriangle, Archive, Boxes, CheckCircle2, FolderTree, ImageOff, Languages, PackageCheck, PackageX, Tags } from 'lucide-react'
import { getDashboardStats } from '@/lib/admin/repository'

const statMeta = [
  ['Total products', 'totalProducts', Boxes],
  ['Published products', 'publishedProducts', CheckCircle2],
  ['Draft products', 'draftProducts', AlertTriangle],
  ['Archived products', 'archivedProducts', Archive],
  ['In-stock products', 'inStockProducts', PackageCheck],
  ['Low-stock products', 'lowStockProducts', AlertTriangle],
  ['Out-of-stock products', 'outOfStockProducts', PackageX],
  ['Products missing images', 'productsMissingImages', ImageOff],
  ['Missing Khmer names', 'productsMissingKhmerNames', Languages],
  ['Missing Khmer descriptions', 'productsMissingKhmerDescriptions', Languages],
  ['Total categories', 'totalCategories', FolderTree],
  ['Total brands', 'totalBrands', Tags],
] as const

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats()

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-950">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-600">Read-only catalog health from the production database.</p>
        </div>
        <Link href="/admin/products" className="btn-primary h-10 rounded-lg bg-slate-950 px-4 hover:bg-slate-800">View Products</Link>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {statMeta.map(([label, key, Icon]) => (
          <article key={key} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
                <p className="mt-2 text-3xl font-black text-slate-950">{stats[key].toLocaleString()}</p>
              </div>
              <span className="grid size-10 place-items-center rounded-lg bg-slate-100 text-slate-700">
                <Icon className="size-5" aria-hidden="true" />
              </span>
            </div>
          </article>
        ))}
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-black text-slate-950">Phase Admin 4A scope</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          This console is read-only. Creation, editing, publishing, deletion, media upload, and AI translation are intentionally reserved for the next phase.
        </p>
      </section>
    </div>
  )
}
