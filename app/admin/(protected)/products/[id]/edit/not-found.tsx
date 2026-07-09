import Link from 'next/link'

export default function AdminProductEditNotFound() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h1 className="text-lg font-black text-slate-950">Product not found</h1>
      <p className="mt-2 text-sm text-slate-600">This product could not be found in the admin catalog.</p>
      <Link href="/admin/products" className="btn-secondary mt-4 inline-flex h-10 rounded-lg px-4">
        Back to Products
      </Link>
    </div>
  )
}
