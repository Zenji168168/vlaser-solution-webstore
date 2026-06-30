'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { Suspense } from 'react'
import { products, CATEGORIES, BRANDS } from '@/lib/products-data'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ProductCard } from '@/components/product-card'
import { useApp } from '@/components/app-context'

function cleanText(text: string): string {
  if (!text) return ''
  return text
    .replace(/â€¢/g, '•').replace(/â€™/g, "'").replace(/â€"/g, '—').replace(/â€œ/g, '"').replace(/â€\x9D/g, '"')
    .replace(/Ã©/g, 'é').replace(/Ã¨/g, 'è').replace(/Â°/g, '°').replace(/Â®/g, '®')
    .replace(/ï¿½/g, '').replace(/\uFFFD/g, '')
    .replace(/\s{2,}/g, ' ').trim()
}

function ProductsInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const { formatPrice, t } = useApp()

  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [category, setCategory] = useState(searchParams.get('category') || 'All')
  const [brand, setBrand] = useState(searchParams.get('brand') || 'All')
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'name')
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1'))
  const [mobileFilters, setMobileFilters] = useState(false)
  const perPage = 24

  // Sync URL
  const updateURL = useCallback((params: Record<string, string>) => {
    const sp = new URLSearchParams()
    Object.entries(params).forEach(([k, v]) => { if (v && v !== 'All' && v !== 'name' && v !== '1') sp.set(k, v) })
    const qs = sp.toString()
    router.replace(`${pathname}${qs ? '?' + qs : ''}`, { scroll: false })
  }, [router, pathname])

  useEffect(() => {
    updateURL({ search, category, brand, sort: sortBy, page: String(page) })
  }, [search, category, brand, sortBy, page, updateURL])

  const filtered = useMemo(() => {
    let r = products
    if (category !== 'All') r = r.filter(p => p.category === category)
    if (brand !== 'All') r = r.filter(p => p.brand === brand)
    if (search) {
      const q = search.toLowerCase()
      r = r.filter(p => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.description.toLowerCase().includes(q))
    }
    if (sortBy === 'price-asc') r = [...r].sort((a, b) => a.price - b.price)
    else if (sortBy === 'price-desc') r = [...r].sort((a, b) => b.price - a.price)
    else r = [...r].sort((a, b) => a.name.localeCompare(b.name))
    return r
  }, [search, category, brand, sortBy])

  const totalPages = Math.ceil(filtered.length / perPage)
  const paginated = filtered.slice((page - 1) * perPage, page * perPage)
  const hasFilters = search || category !== 'All' || brand !== 'All'

  const clearFilters = () => { setSearch(''); setCategory('All'); setBrand('All'); setSortBy('name'); setPage(1) }

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
              <p className="text-sm text-gray-500 mt-1">
                {filtered.length} {t('products','ផលិតផល')} {search && `for "${search}"`}
              </p>
            </div>
            <button onClick={() => setMobileFilters(true)} className="sm:hidden btn-secondary text-xs px-3 py-2">
              {t('Filters','ច្រោះ')}
            </button>
          </div>

          {/* Desktop Filters */}
          <div className="hidden sm:flex flex-wrap gap-2 mb-6">
            <div className="relative flex-grow max-w-sm">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
                placeholder={t('Search...','ស្វែងរក...')} className="input-field pl-9 text-sm" />
            </div>
            <select value={category} onChange={e => { setCategory(e.target.value); setPage(1) }} className="input-field w-auto min-w-[140px] text-sm">
              {CATEGORIES.map(c => <option key={c} value={c}>{c === 'All' ? t('All Categories','គ្រប់ប្រភេទ') : cleanText(c)}</option>)}
            </select>
            <select value={brand} onChange={e => { setBrand(e.target.value); setPage(1) }} className="input-field w-auto min-w-[120px] text-sm">
              {BRANDS.map(b => <option key={b} value={b}>{b === 'All' ? t('All Brands','គ្រប់ម៉ាក') : b}</option>)}
            </select>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="input-field w-auto min-w-[140px] text-sm">
              <option value="name">{t('Name A-Z','ឈ្មោះ A-Z')}</option>
              <option value="price-asc">{t('Price: Low to High','តម្លៃ: ទាប→ខ្ពស់')}</option>
              <option value="price-desc">{t('Price: High to Low','តម្លៃ: ខ្ពស់→ទាប')}</option>
            </select>
            {hasFilters && (
              <button onClick={clearFilters} className="text-xs text-[var(--color-primary)] font-medium hover:underline px-2">{t('Clear all','សម្អាតទាំងអស់')}</button>
            )}
          </div>

          {/* Active filter chips */}
          {hasFilters && (
            <div className="flex flex-wrap gap-2 mb-4">
              {search && <span className="badge badge-info">{t('Search','ស្វែងរក')}: {search} <button onClick={() => setSearch('')} className="ml-1 opacity-60 hover:opacity-100">×</button></span>}
              {category !== 'All' && <span className="badge badge-info">{category} <button onClick={() => setCategory('All')} className="ml-1 opacity-60 hover:opacity-100">×</button></span>}
              {brand !== 'All' && <span className="badge badge-info">{brand} <button onClick={() => setBrand('All')} className="ml-1 opacity-60 hover:opacity-100">×</button></span>}
            </div>
          )}

          {/* Product Grid */}
          {paginated.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {paginated.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-lg font-medium text-gray-600">{t('No products found','រកមិនឃើញផលិតផល')}</p>
              <p className="text-sm text-gray-400 mt-2">{t('Try different filters or search terms','សូមសាកល្បងពាក្យស្វែងរកផ្សេង')}</p>
              {hasFilters && <button onClick={clearFilters} className="btn-primary mt-4 text-xs">{t('Clear Filters','សម្អាតតម្រង')}</button>}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1 mt-10">
              <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1} className="btn-secondary text-xs px-3 py-2 disabled:opacity-30">{t('Prev','មុន')}</button>
              {Array.from({length: Math.min(totalPages, 5)}, (_, i) => {
                let p: number
                if (totalPages <= 5) p = i + 1
                else if (page <= 3) p = i + 1
                else if (page >= totalPages - 2) p = totalPages - 4 + i
                else p = page - 2 + i
                return <button key={p} onClick={() => setPage(p)} className={`w-9 h-9 text-xs font-medium rounded-lg transition-colors ${page === p ? 'bg-[var(--color-primary)] text-white' : 'hover:bg-gray-100 text-gray-600'}`}>{p}</button>
              })}
              <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page===totalPages} className="btn-secondary text-xs px-3 py-2 disabled:opacity-30">{t('Next','បន្ទាប់')}</button>
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
              <h3 className="font-bold text-base">{t('Filters','តម្រង')}</h3>
              <button onClick={() => setMobileFilters(false)} className="text-gray-500 text-sm">{t('Done','រួចរាល់')}</button>
            </div>
            <div className="space-y-3">
              <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder={t('Search...','ស្វែងរក...')} className="input-field" />
              <select value={category} onChange={e => { setCategory(e.target.value); setPage(1) }} className="input-field">
                {CATEGORIES.map(c => <option key={c} value={c}>{c === 'All' ? t('All Categories','គ្រប់ប្រភេទ') : cleanText(c)}</option>)}
              </select>
              <select value={brand} onChange={e => { setBrand(e.target.value); setPage(1) }} className="input-field">
                {BRANDS.map(b => <option key={b} value={b}>{b === 'All' ? t('All Brands','គ្រប់ម៉ាក') : b}</option>)}
              </select>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="input-field">
                <option value="name">{t('Name A-Z','ឈ្មោះ A-Z')}</option>
                <option value="price-asc">{t('Price: Low to High','តម្លៃ: ទាប→ខ្ពស់')}</option>
                <option value="price-desc">{t('Price: High to Low','តម្លៃ: ខ្ពស់→ទាប')}</option>
              </select>
              {hasFilters && <button onClick={() => { clearFilters(); setMobileFilters(false) }} className="w-full btn-secondary text-xs">{t('Clear All','សម្អាតទាំងអស់')}</button>}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-5 h-5 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" /></div>}>
      <ProductsInner />
    </Suspense>
  )
}
