'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { products, CATEGORIES, BRANDS } from '@/lib/products-data'

function ProductsContent() {
  const searchParams = useSearchParams()
  const initCategory = searchParams.get('category') || 'All'
  const initBrand = searchParams.get('brand') || 'All'

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState(initCategory)
  const [brand, setBrand] = useState(initBrand)
  const [sortBy, setSortBy] = useState('name')

  const filtered = useMemo(() => {
    let result = products
    if (category !== 'All') result = result.filter((p) => p.category === category)
    if (brand !== 'All') result = result.filter((p) => p.brand === brand)
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
      )
    }
    if (sortBy === 'price-asc') result = [...result].sort((a, b) => a.price - b.price)
    else if (sortBy === 'price-desc') result = [...result].sort((a, b) => b.price - a.price)
    else result = [...result].sort((a, b) => a.name.localeCompare(b.name))
    return result
  }, [search, category, brand, sortBy])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-background/90 border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <img src="/vlaser-logo.svg" alt="Vlaser" className="h-8" />
          </Link>
          <div className="flex gap-4 items-center">
            <Link href="/" className="text-sm hover:text-primary transition-colors">Home</Link>
            <Link href="/products" className="text-sm text-primary font-semibold">Products</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black mb-1">
            {category !== 'All' ? category : 'All Products'}
            {brand !== 'All' ? ` - ${brand}` : ''}
          </h1>
          <p className="text-muted-foreground text-sm">{products.length} products from {BRANDS.length - 1} brands across {CATEGORIES.length - 1} categories</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3 mb-6 p-4 bg-card/40 border border-border/40 rounded-xl">
          <input
            type="text"
            placeholder="Search by name, SKU, brand..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-grow px-4 py-2.5 bg-background border border-border/60 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 placeholder:text-muted-foreground/60"
          />
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="px-3 py-2.5 bg-background border border-border/60 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/40">
            {CATEGORIES.map((c) => (<option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>))}
          </select>
          <select value={brand} onChange={(e) => setBrand(e.target.value)} className="px-3 py-2.5 bg-background border border-border/60 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/40">
            {BRANDS.map((b) => (<option key={b} value={b}>{b === 'All' ? 'All Brands' : b}</option>))}
          </select>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-3 py-2.5 bg-background border border-border/60 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/40">
            <option value="name">Name A-Z</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>

        <p className="text-xs text-muted-foreground mb-4 font-semibold">{filtered.length} products found</p>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((product) => (
            <Link key={product.id} href={`/products/${product.id}`} className="group">
              <div className="bg-card/50 border border-border/40 hover:border-primary/50 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 h-full flex flex-col">
                <div className="relative h-44 bg-muted/20 flex items-center justify-center overflow-hidden">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                  {product.status === 'Available' && (<span className="absolute top-2 right-2 px-2 py-0.5 bg-green-500/90 text-white text-[10px] rounded-full font-bold">In Stock</span>)}
                  {product.status === 'Out of Stock' && (<span className="absolute top-2 right-2 px-2 py-0.5 bg-red-500/90 text-white text-[10px] rounded-full font-bold">Sold Out</span>)}
                </div>
                <div className="p-4 flex-grow flex flex-col">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-bold text-secondary uppercase">{product.brand}</span>
                    <span className="text-[10px] text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded">{product.category}</span>
                  </div>
                  <h3 className="font-semibold text-sm mb-1 line-clamp-2 group-hover:text-primary transition-colors leading-tight">{product.name}</h3>
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2 flex-grow">{product.description}</p>
                  <div className="flex items-center justify-between pt-2.5 border-t border-border/30">
                    <span className="text-lg font-black text-primary">${product.price.toFixed(2)}</span>
                    <span className="text-[10px] text-muted-foreground font-mono">{product.sku}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-24">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-xl font-bold text-muted-foreground mb-2">No products found</p>
            <p className="text-sm text-muted-foreground">Try different search terms or filters</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border/30 bg-card/20 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <img src="/vlaser-logo.svg" alt="Vlaser" className="h-6" />
          <p className="text-xs text-muted-foreground">&copy; 2026 Vlaser Solution. Technology Service Provider.</p>
        </div>
      </footer>
    </div>
  )
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>}>
      <ProductsContent />
    </Suspense>
  )
}
