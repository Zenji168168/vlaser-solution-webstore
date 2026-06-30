'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { products, CATEGORIES, BRANDS } from '@/lib/products-data'

function ProductsContent() {
  const searchParams = useSearchParams()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState(searchParams.get('category') || 'All')
  const [brand, setBrand] = useState(searchParams.get('brand') || 'All')
  const [sortBy, setSortBy] = useState('name')
  const [page, setPage] = useState(1)
  const perPage = 24

  const filtered = useMemo(() => {
    let r = products
    if (category !== 'All') r = r.filter(p => p.category === category)
    if (brand !== 'All') r = r.filter(p => p.brand === brand)
    if (search) { const q = search.toLowerCase(); r = r.filter(p => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)) }
    if (sortBy === 'price-asc') r = [...r].sort((a,b) => a.price - b.price)
    else if (sortBy === 'price-desc') r = [...r].sort((a,b) => b.price - a.price)
    else r = [...r].sort((a,b) => a.name.localeCompare(b.name))
    return r
  }, [search, category, brand, sortBy])

  const totalPages = Math.ceil(filtered.length / perPage)
  const paginated = filtered.slice((page - 1) * perPage, page * perPage)

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-red-900 to-red-800 flex items-center justify-center text-white font-black text-[10px]">V</div>
            <span className="font-bold text-sm">VLASER</span>
          </Link>
          <div className="flex items-center gap-1">
            <Link href="/" className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted/50">Home</Link>
            <span className="px-3 py-1.5 text-xs text-red-400 font-medium">Products</span>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {category !== 'All' ? category : 'All Products'}
            {brand !== 'All' ? ` — ${brand}` : ''}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">{filtered.length} of {products.length} products</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-2 mb-6">
          <div className="relative flex-grow">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            <input type="text" placeholder="Search products, SKU, brand..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
              className="w-full pl-10 pr-4 py-2.5 bg-card border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-900/40 focus:border-red-900/40 placeholder:text-muted-foreground/50" />
          </div>
          <select value={category} onChange={e => { setCategory(e.target.value); setPage(1) }} className="px-3 py-2.5 bg-card border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-900/40 min-w-[140px]">
            {CATEGORIES.map(c => <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>)}
          </select>
          <select value={brand} onChange={e => { setBrand(e.target.value); setPage(1) }} className="px-3 py-2.5 bg-card border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-900/40 min-w-[130px]">
            {BRANDS.map(b => <option key={b} value={b}>{b === 'All' ? 'All Brands' : b}</option>)}
          </select>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="px-3 py-2.5 bg-card border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-900/40 min-w-[130px]">
            <option value="name">Name A-Z</option>
            <option value="price-asc">Price: Low → High</option>
            <option value="price-desc">Price: High → Low</option>
          </select>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {paginated.map(p => (
            <Link key={p.id} href={`/products/${p.id}`}>
              <div className="product-card bg-card border border-border/40 rounded-2xl overflow-hidden h-full flex flex-col group">
                <div className="aspect-[4/3] bg-muted/20 overflow-hidden relative">
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
                  {p.status === 'Available' && <span className="absolute top-2 left-2 px-2 py-0.5 bg-green-600 text-white text-[9px] rounded-full font-bold uppercase">In Stock</span>}
                  {p.status === 'Out of Stock' && <span className="absolute top-2 left-2 px-2 py-0.5 bg-red-600 text-white text-[9px] rounded-full font-bold uppercase">Sold Out</span>}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="p-3 sm:p-4 flex-grow flex flex-col">
                  <span className="text-[9px] font-semibold text-amber-500 uppercase tracking-wider">{p.brand}</span>
                  <h3 className="font-medium text-xs sm:text-sm mt-0.5 line-clamp-2 leading-snug group-hover:text-red-400 transition-colors">{p.name}</h3>
                  <p className="text-[10px] text-muted-foreground mt-1 line-clamp-1 hidden sm:block">{p.description}</p>
                  <div className="mt-auto pt-2 flex items-center justify-between">
                    <span className="text-sm sm:text-base font-bold">${p.price.toFixed(2)}</span>
                    <span className="text-[9px] text-muted-foreground font-mono hidden sm:inline">{p.sku.substring(0,15)}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty */}
        {filtered.length === 0 && (
          <div className="text-center py-24">
            <div className="text-4xl mb-3">🔍</div>
            <p className="font-semibold text-muted-foreground">No products found</p>
            <p className="text-xs text-muted-foreground mt-1">Try different filters or search terms</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1} className="px-3 py-2 text-xs font-medium border border-border rounded-lg hover:bg-card disabled:opacity-30 disabled:cursor-not-allowed transition-colors">← Prev</button>
            <div className="flex items-center gap-1">
              {Array.from({length: Math.min(totalPages, 7)}, (_, i) => {
                let p: number
                if (totalPages <= 7) p = i + 1
                else if (page <= 4) p = i + 1
                else if (page >= totalPages - 3) p = totalPages - 6 + i
                else p = page - 3 + i
                return (
                  <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 text-xs font-medium rounded-lg transition-colors ${page === p ? 'bg-red-900 text-white' : 'hover:bg-card border border-border/40'}`}>{p}</button>
                )
              })}
            </div>
            <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page===totalPages} className="px-3 py-2 text-xs font-medium border border-border rounded-lg hover:bg-card disabled:opacity-30 disabled:cursor-not-allowed transition-colors">Next →</button>
            <span className="text-[10px] text-muted-foreground ml-2">Page {page} of {totalPages}</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-border/30 py-6 px-4 mt-12 bg-card/20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-red-900 flex items-center justify-center text-white font-black text-[8px]">V</div>
            <span className="text-[10px] text-muted-foreground">Vlaser Solution &copy; 2026</span>
          </div>
          <Link href="/" className="text-[10px] text-muted-foreground hover:text-foreground transition-colors">← Back to Home</Link>
        </div>
      </footer>
    </div>
  )
}

export default function ProductsPage() {
  return (<Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><div className="w-6 h-6 border-2 border-red-900 border-t-transparent rounded-full animate-spin"/></div>}><ProductsContent /></Suspense>)
}
