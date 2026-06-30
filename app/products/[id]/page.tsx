'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { products } from '@/lib/products-data'

export default function ProductDetail() {
  const { id } = useParams()
  const product = products.find(p => p.id === id)

  if (!product) return (
    <div className="min-h-screen bg-background flex items-center justify-center flex-col gap-4">
      <h1 className="text-2xl font-bold">Product Not Found</h1>
      <Link href="/products" className="text-red-400 hover:underline text-sm">← Back to Products</Link>
    </div>
  )

  const related = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4)

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
            <Link href="/" className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">Home</Link>
            <Link href="/products" className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">Products</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-8">
          <Link href="/products" className="hover:text-foreground transition-colors">Products</Link>
          <span>/</span>
          <Link href={`/products?category=${encodeURIComponent(product.category)}`} className="hover:text-foreground transition-colors">{product.category}</Link>
          <span>/</span>
          <span className="text-foreground truncate max-w-[200px]">{product.sku}</span>
        </div>

        {/* Product */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 mb-20">
          {/* Image */}
          <div className="bg-card border border-border/40 rounded-3xl overflow-hidden flex items-center justify-center p-6 min-h-[320px] lg:min-h-[450px] relative group">
            <img src={product.image} alt={product.name} className="max-w-full max-h-[380px] object-contain group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute bottom-4 left-4 flex gap-2">
              {product.status === 'Available' && <span className="px-2.5 py-1 bg-green-600 text-white text-[10px] rounded-full font-bold">In Stock</span>}
              {product.status === 'Out of Stock' && <span className="px-2.5 py-1 bg-red-600 text-white text-[10px] rounded-full font-bold">Sold Out</span>}
              {product.status === 'Price List' && <span className="px-2.5 py-1 bg-blue-600/80 text-white text-[10px] rounded-full font-bold">Order Available</span>}
              {product.status === 'Low Stock' && <span className="px-2.5 py-1 bg-amber-600 text-white text-[10px] rounded-full font-bold">Low Stock</span>}
            </div>
          </div>

          {/* Info */}
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-semibold text-amber-500 uppercase tracking-wider">{product.brand}</span>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground">{product.category}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight mb-2">{product.name}</h1>
            <p className="text-xs text-muted-foreground font-mono mb-6">SKU: {product.sku}</p>
            
            <p className="text-sm text-muted-foreground leading-relaxed mb-8 max-w-lg">{product.description}</p>

            <div className="flex items-baseline gap-2 mb-8">
              <span className="text-3xl sm:text-4xl font-black">${product.price.toFixed(2)}</span>
              <span className="text-sm text-muted-foreground">USD</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <a href={`https://wa.me/85512345678?text=Hi Vlaser, I want to inquire about: ${product.name} (${product.sku}) - $${product.price.toFixed(2)}`}
                target="_blank" rel="noopener noreferrer"
                className="flex-1 text-center px-6 py-3.5 bg-green-700 hover:bg-green-600 text-white font-semibold rounded-xl transition-all hover:shadow-lg text-sm">
                💬 WhatsApp Inquiry
              </a>
              <a href={`mailto:info@vlasersolution.com?subject=Inquiry: ${product.sku}&body=Hi, I am interested in: ${product.name} (${product.sku}) - $${product.price.toFixed(2)}`}
                className="flex-1 text-center px-6 py-3.5 border border-border hover:border-red-900/60 text-foreground font-semibold rounded-xl transition-all hover:bg-red-950/10 text-sm">
                ✉️ Email Inquiry
              </a>
            </div>

            <div className="mt-6 pt-6 border-t border-border/30">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div><span className="text-muted-foreground">Brand:</span> <span className="font-medium ml-1">{product.brand}</span></div>
                <div><span className="text-muted-foreground">Category:</span> <span className="font-medium ml-1">{product.category}</span></div>
                <div><span className="text-muted-foreground">Status:</span> <span className="font-medium ml-1">{product.status}</span></div>
                <div><span className="text-muted-foreground">Stock:</span> <span className="font-medium ml-1">{product.qty > 0 ? `${product.qty} units` : 'On order'}</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="border-t border-border/30 pt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold tracking-tight">Related Products</h2>
              <Link href={`/products?category=${encodeURIComponent(product.category)}`} className="text-xs text-red-400 hover:text-red-300">View all →</Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {related.map(p => (
                <Link key={p.id} href={`/products/${p.id}`}>
                  <div className="product-card bg-card border border-border/40 rounded-2xl overflow-hidden group">
                    <div className="aspect-[4/3] bg-muted/20 overflow-hidden">
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
                    </div>
                    <div className="p-3">
                      <span className="text-[9px] text-amber-500 font-semibold uppercase">{p.brand}</span>
                      <h3 className="text-xs font-medium mt-0.5 line-clamp-2 group-hover:text-red-400 transition-colors">{p.name}</h3>
                      <span className="text-sm font-bold mt-2 block">${p.price.toFixed(2)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <footer className="border-t border-border/30 py-6 px-4 mt-12 bg-card/20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-red-900 flex items-center justify-center text-white font-black text-[8px]">V</div>
            <span className="text-[10px] text-muted-foreground">Vlaser Solution &copy; 2026</span>
          </div>
          <Link href="/products" className="text-[10px] text-muted-foreground hover:text-foreground transition-colors">← All Products</Link>
        </div>
      </footer>
    </div>
  )
}
