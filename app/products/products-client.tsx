'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useApp } from '@/components/app-context'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ProductCard } from '@/components/product-card'
import type { StorefrontProduct } from '@/lib/product-service'

interface Props {
  initialProducts: StorefrontProduct[]
  total: number; page: number; pageSize: number; totalPages: number
  categories: string[]; brands: string[]
  initialSearch: string; initialCategory: string; initialBrand: string; initialSort: string
}

export function ProductsClient({
  initialProducts, total, page, pageSize, totalPages,
  categories, brands, initialSearch, initialCategory, initialBrand, initialSort
}: Props) {
  const { t } = useApp()
  const router = useRouter()
  const pathname = usePathname()
  const [search, setSearch] = useState(initialSearch)
  const [category, setCategory] = useState(initialCategory)
  const [brand, setBrand] = useState(initialBrand)
  const [sortBy, setSortBy] = useState(initialSort)
  const [mobileFilters, setMobileFilters] = useState(false)

  const hasFilters = search || category !== 'All' || brand !== 'All'

  function applyFilters(overrides: Record<string, string> = {}) {
    const params = new URLSearchParams()
    const s = overrides.search ?? search
    const c = overrides.category ?? category
    const b = overrides.brand ?? brand
    const sort = overrides.sort ?? sortBy
    if (s) params.set('search', s)
    if (c && c !== 'All') params.set('category', c)
    if (b && b !== 'All') params.set('brand', b)
    if (sort && sort !== 'name') params.set('sort', sort)
    // Reset to page 1 on filter change
    const qs = params.toString()
    router.push(`${pathname}${qs ? '?' + qs : ''}`)
  }

  function goToPage(p: number) {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (category !== 'All') params.set('category', category)
    if (brand !== 'All') params.set('brand', brand)
    if (sortBy !== 'name') params.set('sort', sortBy)
    if (p > 1) params.set('page', String(p))
    router.push(`${pathname}?${params.toString()}`)
  }

  function clearFilters() {
    setSearch(''); setCategory('All'); setBrand('All'); setSortBy('name')
    router.push(pathname)
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault()
    applyFilters({ search })
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <div className="container-page py-6 sm:py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-gray-500 mb-5">
            <Link href="/" className="hover:text-gray-900 transition-colors">{t('Home','ទំព័រដើម')}</Link>
            <span className="text-gray-300">/</span>
            <span className="text-gray-900 font-medium">{t('Products','ផលិតផល')}</span>
            {category !== 'All' && <><span className="text-gray-300">/</span><span className="text-gray-900">{category}</span></>}
          </nav>

          {/* Title */}
          <div className="flex items-end justify-between mb-6">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                {category !== 'All' ? category : t('All Products','ផលិតផលទាំងអស់')}
                {brand !== 'All' ? ` — ${brand}` : ''}
              </h1>
              <p className="text-sm text-gray-500 mt-1">{total} {t('products','ផលិតផល')} {search && `for "${search}"`}</p>
            </div>
            <button onClick={() => setMobileFilters(true)} className="sm:hidden btn-secondary text-xs px-3 py-2">{t('Filters','ច្រោះ')}</button>
          </div>

          {/* Desktop Filters */}
          <div className="hidden sm:flex flex-wrap gap-2 mb-6">
            <form onSubmit={handleSearchSubmit} className="relative flex-grow max-w-sm">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder={t('Search...','ស្វែងរក...')} className="input-field pl-9 text-sm" />
            </form>
            <select value={category} onChange={e => { setCategory(e.target.value); applyFilters({ category: e.target.value }) }} className="input-field w-auto min-w-[140px] text-sm">
              {categories.map(c => <option key={c} value={c}>{c === 'All' ? t('All Categories','គ្រប់ប្រភេទ') : c}</option>)}
            </select>
            <select value={brand} onChange={e => { setBrand(e.target.value); applyFilters({ brand: e.target.value }) }} className="input-field w-auto min-w-[120px] text-sm">
              {brands.map(b => <option key={b} value={b}>{b === 'All' ? t('All Brands','គ្រប់ម៉ាក') : b}</option>)}
            </select>
            <select value={sortBy} onChange={e => { setSortBy(e.target.value); applyFilters({ sort: e.target.value }) }} className="input-field w-auto min-w-[140px] text-sm">
              <option value="name">{t('Name A-Z','ឈ្មោះ A-Z')}</option>
              <option value="price-asc">{t('Price: Low to High','តម្លៃ: ទាប→ខ្ពស់')}</option>
              <option value="price-desc">{t('Price: High to Low','តម្លៃ: ខ្ពស់→ទាប')}</option>
            </select>
            {hasFilters && <button onClick={clearFilters} className="text-xs text-[var(--color-primary)] font-medium hover:underline px-2">{t('Clear all','សម្អាតទាំងអស់')}</button>}
          </div>

          {/* Active chips */}
          {hasFilters && (
            <div className="flex flex-wrap gap-2 mb-4">
              {search && <span className="badge badge-info">{search} <button onClick={() => { setSearch(''); applyFilters({ search: '' }) }} className="ml-1">×</button></span>}
              {category !== 'All' && <span className="badge badge-info">{category} <button onClick={() => { setCategory('All'); applyFilters({ category: 'All' }) }} className="ml-1">×</button></span>}
              {brand !== 'All' && <span className="badge badge-info">{brand} <button onClick={() => { setBrand('All'); applyFilters({ brand: 'All' }) }} className="ml-1">×</button></span>}
            </div>
          )}

          {/* Grid */}
          {initialProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {initialProducts.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-lg font-medium text-gray-600">{t('No products found','រកមិនឃើញផលិតផល')}</p>
              <p className="text-sm text-gray-400 mt-2">{t('Try different filters','សូមសាកល្បងតម្រងផ្សេង')}</p>
              {hasFilters && <button onClick={clearFilters} className="btn-primary mt-4 text-xs">{t('Clear Filters','សម្អាតតម្រង')}</button>}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1 mt-10">
              <button onClick={() => goToPage(page - 1)} disabled={page <= 1} className="btn-secondary text-xs px-3 py-2 disabled:opacity-30">{t('Prev','មុន')}</button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let p: number
                if (totalPages <= 5) p = i + 1
                else if (page <= 3) p = i + 1
                else if (page >= totalPages - 2) p = totalPages - 4 + i
                else p = page - 2 + i
                return <button key={p} onClick={() => goToPage(p)} className={`w-9 h-9 text-xs font-medium rounded-lg transition-colors ${page === p ? 'bg-[var(--color-primary)] text-white' : 'hover:bg-gray-100 text-gray-600'}`}>{p}</button>
              })}
              <button onClick={() => goToPage(page + 1)} disabled={page >= totalPages} className="btn-secondary text-xs px-3 py-2 disabled:opacity-30">{t('Next','បន្ទាប់')}</button>
            </div>
          )}
        </div>
      </main>

      {/* Mobile filter drawer */}
      {mobileFilters && (
        <div className="fixed inset-0 z-[100] sm:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setMobileFilters(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-xl p-5 animate-fade-up max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold">{t('Filters','តម្រង')}</h3>
              <button onClick={() => setMobileFilters(false)} className="text-sm text-gray-500">{t('Done','រួចរាល់')}</button>
            </div>
            <div className="space-y-3">
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder={t('Search...','ស្វែងរក...')} className="input-field" />
              <select value={category} onChange={e => setCategory(e.target.value)} className="input-field">{categories.map(c => <option key={c} value={c}>{c === 'All' ? t('All Categories','គ្រប់ប្រភេទ') : c}</option>)}</select>
              <select value={brand} onChange={e => setBrand(e.target.value)} className="input-field">{brands.map(b => <option key={b} value={b}>{b === 'All' ? t('All Brands','គ្រប់ម៉ាក') : b}</option>)}</select>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="input-field">
                <option value="name">{t('Name A-Z','ឈ្មោះ')}</option><option value="price-asc">{t('Price Low','តម្លៃទាប')}</option><option value="price-desc">{t('Price High','តម្លៃខ្ពស់')}</option>
              </select>
              <button onClick={() => { applyFilters(); setMobileFilters(false) }} className="w-full btn-primary text-sm">{t('Apply','អនុវត្ត')}</button>
              {hasFilters && <button onClick={() => { clearFilters(); setMobileFilters(false) }} className="w-full btn-secondary text-xs">{t('Clear All','សម្អាតទាំងអស់')}</button>}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
