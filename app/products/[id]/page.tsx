'use client'

import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'
import { products } from '@/lib/products-data'
import { useApp, LangCurrencyToggle } from '@/components/app-context'

export default function ProductDetail() {
  const { id } = useParams()
  const router = useRouter()
  const product = products.find(p => p.id === id)
  const { formatPrice, t } = useApp()
  const [showConfirm, setShowConfirm] = useState(false)
  const [qty, setQty] = useState(1)

  if (!product) return (
    <div className="min-h-screen bg-white flex items-center justify-center flex-col gap-4">
      <h1 className="text-2xl font-bold">Product Not Found</h1>
      <Link href="/products" className="text-primary hover:underline text-sm">← Back to Products</Link>
    </div>
  )

  const related = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4)

  const handleOrder = () => {
    const total = (product.price * qty).toFixed(2)
    const msg = `🛒 សំណើបញ្ជាទិញ
——————————
ផលិតផល: ${product.name}
SKU: ${product.sku}
ម៉ាក: ${product.brand}
ចំនួន: ${qty}
តម្លៃ: $${product.price.toFixed(2)} x ${qty} = $${total}
——————————
សូមស្វាគមន៍! ខ្ញុំចង់បញ្ជាទិញផលិតផលនេះ។ តើនៅមានស្តុកទេ?`
    window.open(`https://t.me/SANGHAMEUK?text=${encodeURIComponent(msg)}`, '_blank')
  }

  return (
    <div className="min-h-screen bg-white text-foreground">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <img src="/vlaser-logo.png" alt="Vlaser" className="h-8 object-contain" />
              <span className="text-base font-bold tracking-tight text-gray-900 hidden sm:block">Vlaser <span className="text-primary">Store</span></span>
            </div>
          </Link>
          <div className="flex items-center gap-1">
            <Link href="/" className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">Home</Link>
            <Link href="/products" className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">Products</Link>
            <LangCurrencyToggle />
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-8">
          <Link href="/products" className="hover:text-foreground transition-colors">Products</Link>
          <span className="text-border">/</span>
          <Link href={`/products?category=${encodeURIComponent(product.category)}`} className="hover:text-foreground transition-colors">{product.category}</Link>
          <span className="text-border">/</span>
          <span className="text-foreground truncate max-w-[200px]">{product.sku}</span>
        </div>

        {/* Product */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 mb-20">
          {/* Image */}
          <div className="gradient-border bg-gray-50 rounded-3xl overflow-hidden flex items-center justify-center p-6 min-h-[320px] lg:min-h-[450px] relative group">
            <img src={product.image} alt={product.name} className="max-w-full max-h-[400px] object-contain group-hover:scale-105 transition-transform duration-500" />
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
              <span className="text-xs font-bold text-primary/70 uppercase tracking-wider">{product.brand}</span>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground">{product.category}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight mb-2">{product.name}</h1>
            <p className="text-xs text-muted-foreground font-mono mb-6">SKU: {product.sku}</p>
            <p className="text-sm text-muted-foreground leading-relaxed mb-8 max-w-lg">{product.description}</p>

            <div className="flex items-baseline gap-2 mb-8">
              <span className="text-4xl font-black text-primary">{formatPrice(product.price)}</span>
            </div>

            {/* Order Button */}
            <button
              onClick={() => setShowConfirm(true)}
              className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-primary to-primary/90 hover:from-red-700 hover:to-red-600 text-white font-bold rounded-2xl transition-all hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-0.5 text-base relative overflow-hidden group"
            >
              <span className="relative z-10">🛒 Order Now</span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
            </button>

            {/* Product specs */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="flex justify-between p-3 bg-gray-50/60 rounded-lg"><span className="text-muted-foreground">Brand</span><span className="font-medium">{product.brand}</span></div>
                <div className="flex justify-between p-3 bg-gray-50/60 rounded-lg"><span className="text-muted-foreground">Category</span><span className="font-medium">{product.category}</span></div>
                <div className="flex justify-between p-3 bg-gray-50/60 rounded-lg"><span className="text-muted-foreground">Status</span><span className="font-medium">{product.status}</span></div>
                <div className="flex justify-between p-3 bg-gray-50/60 rounded-lg"><span className="text-muted-foreground">Stock</span><span className="font-medium">{product.qty > 0 ? `${product.qty} units` : 'On order'}</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="border-t border-gray-100 pt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold tracking-tight">Related Products</h2>
              <Link href={`/products?category=${encodeURIComponent(product.category)}`} className="text-xs text-primary hover:text-red-300">View all →</Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {related.map(p => (
                <Link key={p.id} href={`/products/${p.id}`}>
                  <div className="product-card bg-gray-50 border border-gray-100 rounded-2xl overflow-hidden group">
                    <div className="aspect-[4/3] bg-gray-50 overflow-hidden">
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
                    </div>
                    <div className="p-3">
                      <span className="text-[9px] text-primary/70 font-semibold uppercase">{p.brand}</span>
                      <h3 className="text-xs font-medium mt-0.5 line-clamp-2 group-hover:text-primary transition-colors">{p.name}</h3>
                      <span className="text-sm font-bold mt-2 block">${p.price.toFixed(2)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* === ORDER CONFIRMATION MODAL === */}
      {showConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setShowConfirm(false)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div className="relative bg-gray-50 border border-gray-200 rounded-3xl p-8 max-w-md w-full shadow-2xl scale-in" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-red-800 to-red-900 flex items-center justify-center text-2xl">🛒</div>
              <h3 className="text-xl font-bold">Confirm Order</h3>
              <p className="text-xs text-muted-foreground mt-1">Review your order before sending</p>
            </div>

            {/* Product Summary */}
            <div className="bg-gray-50 rounded-2xl p-4 mb-6 border border-gray-100">
              <div className="flex gap-4">
                <img src={product.image} alt={product.name} className="w-16 h-16 rounded-xl object-cover bg-muted/50" />
                <div className="flex-grow min-w-0">
                  <p className="text-[10px] text-primary/70 font-bold uppercase">{product.brand}</p>
                  <h4 className="text-sm font-semibold truncate">{product.name}</h4>
                  <p className="text-[10px] text-muted-foreground font-mono">SKU: {product.sku}</p>
                </div>
              </div>
            </div>

            {/* Quantity */}
            <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-xl">
              <span className="text-sm text-muted-foreground">Quantity</span>
              <div className="flex items-center gap-3">
                <button onClick={() => setQty(q => Math.max(1, q-1))} className="w-8 h-8 rounded-lg bg-gray-50 border border-border flex items-center justify-center text-sm font-bold hover:bg-muted/50 transition-colors">−</button>
                <span className="text-base font-bold w-8 text-center">{qty}</span>
                <button onClick={() => setQty(q => q+1)} className="w-8 h-8 rounded-lg bg-gray-50 border border-border flex items-center justify-center text-sm font-bold hover:bg-muted/50 transition-colors">+</button>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-center justify-between mb-6 p-3 bg-gray-50 rounded-xl">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="text-2xl font-black text-primary">{formatPrice(product.price * qty)}</span>
            </div>

            {/* Actions */}
            <button
              onClick={handleOrder}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold rounded-xl transition-all hover:shadow-lg text-sm flex items-center justify-center gap-2"
            >
              <span>✈️</span> Confirm & Send via Telegram
            </button>
            <button onClick={() => setShowConfirm(false)} className="w-full py-3 text-sm text-muted-foreground hover:text-foreground transition-colors mt-3">
              Cancel
            </button>

            <p className="text-[10px] text-muted-foreground text-center mt-4">
              Your order will be sent to our Telegram.<br/>We will reply within minutes.
            </p>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-gray-100 py-6 px-4 mt-12 bg-gray-50/20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/vlaser-logo.png" alt="Vlaser" className="h-5 object-contain" />
            <span className="text-[10px] text-muted-foreground">&copy; 2026 Vlaser Solution Cambodia</span>
          </div>
          <Link href="/products" className="text-[10px] text-muted-foreground hover:text-foreground transition-colors">← All Products</Link>
        </div>
      </footer>
    </div>
  )
}




