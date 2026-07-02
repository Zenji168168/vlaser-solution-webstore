import Link from 'next/link'
import { Eye, Search } from 'lucide-react'
import { getAdminProductOptions, getAdminProducts, getStockLabel } from '@/lib/admin/repository'

interface Props {
  searchParams: Promise<Record<string, string | undefined>>
}

function nextQuery(params: Record<string, string | undefined>, patch: Record<string, string | number | undefined>) {
  const query = new URLSearchParams()
  Object.entries({ ...params, ...patch }).forEach(([key, value]) => {
    if (value && value !== 'all') query.set(key, String(value))
  })
  const result = query.toString()
  return result ? `/admin/products?${result}` : '/admin/products'
}

function statusText(published: boolean, archived: boolean) {
  if (archived) return 'Archived'
  return published ? 'Published' : 'Draft'
}

export default async function AdminProductsPage({ searchParams }: Props) {
  const params = await searchParams
  const filters = {
    search: params.search,
    category: params.category,
    brand: params.brand,
    stock: params.stock,
    publication: params.publication,
    khmer: params.khmer,
    sort: params.sort,
    page: params.page ? Number(params.page) : 1,
    pageSize: 20,
  }
  const [result, options] = await Promise.all([
    getAdminProducts(filters),
    getAdminProductOptions(),
  ])

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-950">Products</h1>
        <p className="mt-1 text-sm text-slate-600">Read-only product management list with server-side filtering.</p>
      </div>

      <form className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm" action="/admin/products">
        <div className="grid gap-3 lg:grid-cols-[minmax(220px,1fr)_repeat(5,minmax(140px,180px))_140px]">
          <label className="relative">
            <span className="sr-only">Search</span>
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input name="search" defaultValue={params.search || ''} placeholder="Search name, SKU, model" className="input-field h-10 rounded-lg pl-10" />
          </label>
          <select name="category" defaultValue={params.category || 'all'} className="input-field h-10 rounded-lg">
            <option value="all">All categories</option>
            {options.categories.map(category => <option key={category.slug} value={category.slug}>{category.name}</option>)}
          </select>
          <select name="brand" defaultValue={params.brand || 'all'} className="input-field h-10 rounded-lg">
            <option value="all">All brands</option>
            {options.brands.map(brand => <option key={brand.slug} value={brand.slug}>{brand.name}</option>)}
          </select>
          <select name="stock" defaultValue={params.stock || 'all'} className="input-field h-10 rounded-lg">
            <option value="all">All stock</option>
            <option value="in">In stock</option>
            <option value="low">Low stock</option>
            <option value="out">Out of stock</option>
          </select>
          <select name="publication" defaultValue={params.publication || 'all'} className="input-field h-10 rounded-lg">
            <option value="all">All publication</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
          <select name="khmer" defaultValue={params.khmer || 'all'} className="input-field h-10 rounded-lg">
            <option value="all">All Khmer status</option>
            <option value="complete">Complete</option>
            <option value="missing-name">Missing name</option>
            <option value="missing-description">Missing description</option>
            <option value="missing-any">Missing any</option>
          </select>
          <select name="sort" defaultValue={params.sort || 'updated-desc'} className="input-field h-10 rounded-lg">
            <option value="updated-desc">Recently updated</option>
            <option value="name-asc">Name A-Z</option>
            <option value="price-asc">Price low-high</option>
            <option value="price-desc">Price high-low</option>
            <option value="stock-asc">Stock low-high</option>
            <option value="stock-desc">Stock high-low</option>
          </select>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="submit" className="btn-primary h-10 rounded-lg bg-slate-950 px-4 hover:bg-slate-800">Apply Filters</button>
          <Link href="/admin/products" className="btn-secondary h-10 rounded-lg px-4">Reset</Link>
        </div>
      </form>

      <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
          <p className="text-sm font-semibold text-slate-700">{result.total.toLocaleString()} products</p>
          <p className="text-sm text-slate-500">Page {result.page} of {result.totalPages}</p>
        </div>

        {result.products.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-base font-bold text-slate-950">No products match these filters</p>
            <p className="mt-1 text-sm text-slate-600">Try a broader search or reset the filters.</p>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto lg:block">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3">SKU</th>
                    <th className="px-4 py-3">Brand</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3">Stock</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Khmer</th>
                    <th className="px-4 py-3">Updated</th>
                    <th className="px-4 py-3">Preview</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {result.products.map(product => (
                    <tr key={product.id} className="align-top">
                      <td className="px-4 py-3">
                        <div className="flex gap-3">
                          <img src={product.image} alt="" className="size-12 rounded-lg border border-slate-200 object-contain" />
                          <div className="max-w-sm">
                            <p className="line-clamp-2 font-semibold text-slate-950">{product.nameEn}</p>
                            <p className="text-xs text-slate-500">{product.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-700">{product.sku}</td>
                      <td className="px-4 py-3">{product.brand}</td>
                      <td className="px-4 py-3">{product.category}</td>
                      <td className="px-4 py-3 font-semibold">${product.price.toFixed(2)}</td>
                      <td className="px-4 py-3">{product.stockQty} <span className="text-xs text-slate-500">{getStockLabel(product.stockQty, product.stockStatus)}</span></td>
                      <td className="px-4 py-3">{statusText(product.published, product.archived)}</td>
                      <td className="px-4 py-3">{product.nameKm ? 'Name OK' : 'Missing name'}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">{product.updatedAt ? product.updatedAt.toLocaleDateString('en-US') : 'N/A'}</td>
                      <td className="px-4 py-3">
                        <Link href={`/admin/products/${product.id}`} className="inline-flex size-9 items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 focus-ring" aria-label={`Preview ${product.sku}`}>
                          <Eye className="size-4" aria-hidden="true" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid gap-3 p-3 lg:hidden">
              {result.products.map(product => (
                <article key={product.id} className="rounded-lg border border-slate-200 p-3">
                  <div className="flex gap-3">
                    <img src={product.image} alt="" className="size-16 rounded-lg border border-slate-200 object-contain" />
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-3 text-sm font-bold text-slate-950">{product.nameEn}</p>
                      <p className="mt-1 font-mono text-xs text-slate-500">{product.sku}</p>
                    </div>
                  </div>
                  <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div><dt className="text-slate-500">Brand</dt><dd className="font-semibold">{product.brand}</dd></div>
                    <div><dt className="text-slate-500">Category</dt><dd className="font-semibold">{product.category}</dd></div>
                    <div><dt className="text-slate-500">Price</dt><dd className="font-semibold">${product.price.toFixed(2)}</dd></div>
                    <div><dt className="text-slate-500">Stock</dt><dd className="font-semibold">{product.stockQty}</dd></div>
                  </dl>
                  <Link href={`/admin/products/${product.id}`} className="btn-secondary mt-3 h-10 w-full rounded-lg">
                    <Eye className="size-4" aria-hidden="true" />
                    Preview
                  </Link>
                </article>
              ))}
            </div>
          </>
        )}

        <div className="flex items-center justify-between gap-3 border-t border-slate-200 px-4 py-3">
          <Link href={nextQuery(params, { page: Math.max(1, result.page - 1) })} aria-disabled={result.page <= 1} className={`btn-secondary h-10 rounded-lg px-4 ${result.page <= 1 ? 'pointer-events-none opacity-50' : ''}`}>Previous</Link>
          <Link href={nextQuery(params, { page: Math.min(result.totalPages, result.page + 1) })} aria-disabled={result.page >= result.totalPages} className={`btn-secondary h-10 rounded-lg px-4 ${result.page >= result.totalPages ? 'pointer-events-none opacity-50' : ''}`}>Next</Link>
        </div>
      </div>
    </div>
  )
}
