'use client'

import { FormEvent, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Filter, RotateCcw, Search, SlidersHorizontal, X } from 'lucide-react'
import { useApp } from '@/components/app-context'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ProductCard } from '@/components/product-card'
import type { StorefrontProduct } from '@/lib/product-service'

interface Props {
  initialProducts: StorefrontProduct[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  categories: string[]
  brands: string[]
  initialSearch: string
  initialCategory: string
  initialBrand: string
  initialSort: string
}

export function ProductsClient({
  initialProducts,
  total,
  page,
  totalPages,
  categories,
  brands,
  initialSearch,
  initialCategory,
  initialBrand,
  initialSort,
}: Props) {
  const { t } = useApp()
  const router = useRouter()
  const pathname = usePathname()
  const [search, setSearch] = useState(initialSearch)
  const [category, setCategory] = useState(initialCategory)
  const [brand, setBrand] = useState(initialBrand)
  const [sortBy, setSortBy] = useState(initialSort)
  const [mobileFilters, setMobileFilters] = useState(false)
  const sheetRef = useRef<HTMLDivElement>(null)
  const filterButtonRef = useRef<HTMLButtonElement>(null)

  const hasFilters = Boolean(search || category !== 'All' || brand !== 'All' || sortBy !== 'name')

  useEffect(() => {
    setSearch(initialSearch)
    setCategory(initialCategory)
    setBrand(initialBrand)
    setSortBy(initialSort)
  }, [initialSearch, initialCategory, initialBrand, initialSort])

  useEffect(() => {
    if (!mobileFilters) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const focusableSelector = 'button:not([disabled]), input:not([disabled]), select:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
    const focusable = () => Array.from(sheetRef.current?.querySelectorAll<HTMLElement>(focusableSelector) || [])
    focusable()[0]?.focus()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileFilters(false)
        return
      }
      if (event.key !== 'Tab') return
      const items = focusable()
      if (!items.length) return
      if (event.shiftKey && document.activeElement === items[0]) {
        event.preventDefault()
        items[items.length - 1].focus()
      } else if (!event.shiftKey && document.activeElement === items[items.length - 1]) {
        event.preventDefault()
        items[0].focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
      filterButtonRef.current?.focus()
    }
  }, [mobileFilters])

  function buildPath(overrides: Record<string, string | number> = {}) {
    const params = new URLSearchParams()
    const nextSearch = String(overrides.search ?? search).trim()
    const nextCategory = String(overrides.category ?? category)
    const nextBrand = String(overrides.brand ?? brand)
    const nextSort = String(overrides.sort ?? sortBy)
    const nextPage = Number(overrides.page ?? 1)
    if (nextSearch) params.set('search', nextSearch)
    if (nextCategory && nextCategory !== 'All') params.set('category', nextCategory)
    if (nextBrand && nextBrand !== 'All') params.set('brand', nextBrand)
    if (nextSort && nextSort !== 'name') params.set('sort', nextSort)
    if (nextPage > 1) params.set('page', String(nextPage))
    const qs = params.toString()
    return `${pathname}${qs ? `?${qs}` : ''}`
  }

  function applyFilters(overrides: Record<string, string | number> = {}) {
    router.push(buildPath(overrides))
  }

  function goToPage(nextPage: number) {
    applyFilters({ page: nextPage })
  }

  function clearFilters() {
    setSearch('')
    setCategory('All')
    setBrand('All')
    setSortBy('name')
    router.push(pathname)
  }

  function handleSearchSubmit(event: FormEvent) {
    event.preventDefault()
    applyFilters({ search, page: 1 })
  }

  const chips = [
    search ? { label: search, clear: () => { setSearch(''); applyFilters({ search: '', page: 1 }) } } : null,
    category !== 'All' ? { label: category, clear: () => { setCategory('All'); applyFilters({ category: 'All', page: 1 }) } } : null,
    brand !== 'All' ? { label: brand, clear: () => { setBrand('All'); applyFilters({ brand: 'All', page: 1 }) } } : null,
    sortBy !== 'name' ? { label: sortBy === 'price-asc' ? t('Price low to high', 'តម្លៃទាបទៅខ្ពស់') : t('Price high to low', 'តម្លៃខ្ពស់ទៅទាប'), clear: () => { setSortBy('name'); applyFilters({ sort: 'name', page: 1 }) } } : null,
  ].filter(Boolean) as Array<{ label: string; clear: () => void }>

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-grow">
        <div className="container-page py-5 sm:py-8">
          <nav className="flex items-center gap-1.5 text-xs text-gray-500 mb-5">
            <Link href="/" className="hover:text-gray-950 transition-colors focus-ring rounded-md">{t('Home', 'ទំព័រដើម')}</Link>
            <span className="text-gray-300">/</span>
            <span className="text-gray-950 font-semibold">{t('Products', 'ផលិតផល')}</span>
            {category !== 'All' && <><span className="text-gray-300">/</span><span className="text-gray-700 truncate">{category}</span></>}
          </nav>

          <div className="mb-5 flex flex-col gap-4 sm:mb-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[var(--color-primary)]">{t('Live product catalog', 'បញ្ជីផលិតផលបច្ចុប្បន្ន')}</p>
              <h1 className="max-w-3xl text-2xl font-black tracking-tight text-gray-950 sm:text-3xl">
                {category !== 'All' ? category : t('All Products', 'ផលិតផលទាំងអស់')}
                {brand !== 'All' ? ` - ${brand}` : ''}
              </h1>
              <p className="mt-2 text-sm text-gray-500">{total.toLocaleString()} {t('products', 'ផលិតផល')}{search && ` ${t('for', 'សម្រាប់')} "${search}"`}</p>
            </div>
            <div className="flex gap-2 sm:hidden">
              <button ref={filterButtonRef} onClick={() => setMobileFilters(true)} className="btn-secondary h-11 flex-1 px-3 text-xs" aria-haspopup="dialog">
                <Filter className="size-4" aria-hidden="true" />
                {t('Filters', 'តម្រង')}
              </button>
              <button onClick={() => setMobileFilters(true)} className="btn-secondary h-11 flex-1 px-3 text-xs" aria-haspopup="dialog">
                <SlidersHorizontal className="size-4" aria-hidden="true" />
                {t('Sort', 'តម្រៀប')}
              </button>
            </div>
          </div>

          <div className="hidden rounded-2xl border border-gray-100 bg-gray-50/70 p-3 sm:block sm:mb-5">
            <div className="flex flex-wrap gap-2">
              <form onSubmit={handleSearchSubmit} className="relative min-w-[260px] flex-1">
                <label className="sr-only" htmlFor="product-search">{t('Search products', 'ស្វែងរកផលិតផល')}</label>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" aria-hidden="true" />
                <input id="product-search" type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder={t('Search by product, brand, or SKU...', 'ស្វែងរកតាមផលិតផល ម៉ាក ឬ SKU...')} className="input-field h-11 pl-9 text-sm" />
              </form>
              <select value={category} onChange={event => { setCategory(event.target.value); applyFilters({ category: event.target.value, page: 1 }) }} className="input-field h-11 w-auto min-w-[160px] text-sm" aria-label={t('Category filter', 'តម្រងប្រភេទ')}>
                {categories.map(c => <option key={c} value={c}>{c === 'All' ? t('All Categories', 'គ្រប់ប្រភេទ') : c}</option>)}
              </select>
              <select value={brand} onChange={event => { setBrand(event.target.value); applyFilters({ brand: event.target.value, page: 1 }) }} className="input-field h-11 w-auto min-w-[140px] text-sm" aria-label={t('Brand filter', 'តម្រងម៉ាក')}>
                {brands.map(b => <option key={b} value={b}>{b === 'All' ? t('All Brands', 'គ្រប់ម៉ាក') : b}</option>)}
              </select>
              <select value={sortBy} onChange={event => { setSortBy(event.target.value); applyFilters({ sort: event.target.value, page: 1 }) }} className="input-field h-11 w-auto min-w-[170px] text-sm" aria-label={t('Sort products', 'តម្រៀបផលិតផល')}>
                <option value="name">{t('Name A-Z', 'ឈ្មោះ A-Z')}</option>
                <option value="price-asc">{t('Price: Low to High', 'តម្លៃ: ទាបទៅខ្ពស់')}</option>
                <option value="price-desc">{t('Price: High to Low', 'តម្លៃ: ខ្ពស់ទៅទាប')}</option>
              </select>
              {hasFilters && <button onClick={clearFilters} className="btn-secondary h-11 px-3 text-xs"><RotateCcw className="size-4" aria-hidden="true" />{t('Clear', 'សម្អាត')}</button>}
            </div>
          </div>

          {chips.length > 0 && (
            <div className="mb-5 flex flex-wrap gap-2" aria-label={t('Active filters', 'តម្រងកំពុងប្រើ')}>
              {chips.map(chip => (
                <button key={chip.label} onClick={chip.clear} className="badge badge-info min-h-8 gap-1.5 animate-scale-in focus-ring">
                  <span>{chip.label}</span>
                  <X className="size-3" aria-hidden="true" />
                </button>
              ))}
              <button onClick={clearFilters} className="min-h-8 rounded-lg px-2.5 text-xs font-bold text-[var(--color-primary)] hover:bg-red-50 focus-ring">{t('Clear all', 'សម្អាតទាំងអស់')}</button>
            </div>
          )}

          {initialProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
              {initialProducts.map(product => <ProductCard key={product.id} product={product} />)}
            </div>
          ) : (
            <div className="surface-panel mx-auto my-12 max-w-xl px-6 py-12 text-center">
              <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-red-50 text-[var(--color-primary)]">
                <Search className="size-6" aria-hidden="true" />
              </div>
              <h2 className="mt-4 text-lg font-black text-gray-950">{t('No products found', 'រកមិនឃើញផលិតផល')}</h2>
              <p className="mt-2 text-sm leading-6 text-gray-500">{t('Try a different search term, category, or brand filter.', 'សូមសាកល្បងពាក្យស្វែងរក ប្រភេទ ឬម៉ាកផ្សេងទៀត។')}</p>
              {hasFilters && <button onClick={clearFilters} className="btn-primary mt-5 text-sm">{t('Clear Filters', 'សម្អាតតម្រង')}</button>}
            </div>
          )}

          {totalPages > 1 && (
            <nav className="mt-10 flex items-center justify-center gap-1" aria-label={t('Pagination', 'ទំព័រ')}>
              <button onClick={() => goToPage(page - 1)} disabled={page <= 1} className="btn-secondary h-10 px-3 text-xs">{t('Prev', 'មុន')}</button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let nextPage: number
                if (totalPages <= 5) nextPage = i + 1
                else if (page <= 3) nextPage = i + 1
                else if (page >= totalPages - 2) nextPage = totalPages - 4 + i
                else nextPage = page - 2 + i
                return (
                  <button key={nextPage} onClick={() => goToPage(nextPage)} aria-current={page === nextPage ? 'page' : undefined} className={`h-10 w-10 rounded-xl text-xs font-black transition-colors focus-ring ${page === nextPage ? 'bg-[var(--color-primary)] text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                    {nextPage}
                  </button>
                )
              })}
              <button onClick={() => goToPage(page + 1)} disabled={page >= totalPages} className="btn-secondary h-10 px-3 text-xs">{t('Next', 'បន្ទាប់')}</button>
            </nav>
          )}
        </div>
      </main>

      {mobileFilters && (
        <div className="fixed inset-0 z-[100] sm:hidden" role="dialog" aria-modal="true" aria-label={t('Product filters', 'តម្រងផលិតផល')}>
          <button className="absolute inset-0 bg-black/35 backdrop-blur-[2px] animate-fade-in" onClick={() => setMobileFilters(false)} aria-label={t('Close filters', 'បិទតម្រង')} />
          <div ref={sheetRef} className="absolute inset-x-0 bottom-0 max-h-[86vh] overflow-y-auto rounded-t-3xl bg-white p-5 shadow-xl animate-sheet-in">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-gray-950">{t('Filters and Sort', 'តម្រង និងតម្រៀប')}</h2>
                <p className="text-xs text-gray-500">{total.toLocaleString()} {t('matching products', 'ផលិតផលត្រូវគ្នា')}</p>
              </div>
              <button onClick={() => setMobileFilters(false)} className="tap-target inline-flex items-center justify-center rounded-xl text-gray-500 hover:bg-gray-50 focus-ring" aria-label={t('Close', 'បិទ')}><X className="size-5" /></button>
            </div>
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500" htmlFor="mobile-product-search">{t('Search', 'ស្វែងរក')}</label>
              <input id="mobile-product-search" type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder={t('Search...', 'ស្វែងរក...')} className="input-field" />
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500" htmlFor="mobile-category">{t('Category', 'ប្រភេទ')}</label>
              <select id="mobile-category" value={category} onChange={event => setCategory(event.target.value)} className="input-field">{categories.map(c => <option key={c} value={c}>{c === 'All' ? t('All Categories', 'គ្រប់ប្រភេទ') : c}</option>)}</select>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500" htmlFor="mobile-brand">{t('Brand', 'ម៉ាក')}</label>
              <select id="mobile-brand" value={brand} onChange={event => setBrand(event.target.value)} className="input-field">{brands.map(b => <option key={b} value={b}>{b === 'All' ? t('All Brands', 'គ្រប់ម៉ាក') : b}</option>)}</select>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500" htmlFor="mobile-sort">{t('Sort', 'តម្រៀប')}</label>
              <select id="mobile-sort" value={sortBy} onChange={event => setSortBy(event.target.value)} className="input-field">
                <option value="name">{t('Name A-Z', 'ឈ្មោះ A-Z')}</option>
                <option value="price-asc">{t('Price: Low to High', 'តម្លៃ: ទាបទៅខ្ពស់')}</option>
                <option value="price-desc">{t('Price: High to Low', 'តម្លៃ: ខ្ពស់ទៅទាប')}</option>
              </select>
              <button onClick={() => { applyFilters({ page: 1 }); setMobileFilters(false) }} className="btn-primary mt-3 h-12 w-full text-sm">{t('Apply Filters', 'អនុវត្តតម្រង')}</button>
              {hasFilters && <button onClick={() => { clearFilters(); setMobileFilters(false) }} className="btn-secondary h-11 w-full text-sm">{t('Clear All', 'សម្អាតទាំងអស់')}</button>}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
