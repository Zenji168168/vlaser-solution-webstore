'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useApp } from '@/components/app-context'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ProductCard } from '@/components/product-card'
import { ProductSpecifications } from '@/components/product-specifications'
import { cleanText, isGenericDescription, parseDescription, addToRecentlyViewed, getRecentlyViewed } from '@/lib/product-utils'
import { products as staticProducts } from '@/lib/products-data'
import type { StorefrontProduct } from '@/lib/product-service'

interface Props { product: StorefrontProduct; related: StorefrontProduct[] }

export function ProductDetailClient({ product, related }: Props) {
  const { formatPrice, t, lang } = useApp()
  const [showConfirm, setShowConfirm] = useState(false)
  const [qty, setQty] = useState(1)
  const [fullscreen, setFullscreen] = useState(false)
  const [recentProducts, setRecentProducts] = useState<StorefrontProduct[]>([])

  useEffect(() => {
    addToRecentlyViewed(product.id)
    const ids = getRecentlyViewed().filter(rid => rid !== product.id)
    const recent = ids.map(rid => staticProducts.find(p => p.id === rid)).filter(Boolean).slice(0, 4) as unknown as StorefrontProduct[]
    setRecentProducts(recent)
  }, [product.id])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') { setFullscreen(false); setShowConfirm(false) } }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const desc = parseDescription(product.description)
  const hasRealDescription = !isGenericDescription(product.description)
  const productUrl = typeof window !== 'undefined' ? window.location.href : `https://store.vlasersolution.com/products/${product.id}`

  const handleOrder = () => {
    const total = (product.price * qty).toFixed(2)
    const msg = lang === 'km'
      ? `🛒 សំណើបញ្ជាទិញ\n——————————\nផលិតផល: ${product.name}\nSKU: ${product.sku}\nម៉ាក: ${product.brand}\nចំនួន: ${qty}\nតម្លៃ: $${product.price.toFixed(2)} x ${qty} = $${total}\nURL: ${productUrl}\n——————————\nសូមស្វាគមន៍! ខ្ញុំចង់បញ្ជាទិញផលិតផលនេះ។`
      : `🛒 Order Request\n——————————\nProduct: ${product.name}\nSKU: ${product.sku}\nBrand: ${product.brand}\nQty: ${qty}\nPrice: $${product.price.toFixed(2)} x ${qty} = $${total}\nURL: ${productUrl}\n——————————\nHi! I would like to order this product.`
    window.open(`https://t.me/SANGHAMEUK?text=${encodeURIComponent(msg)}`, '_blank')
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <div className="container-page py-6 sm:py-8">
          <nav className="flex items-center gap-1.5 text-xs text-gray-500 mb-6">
            <Link href="/" className="hover:text-gray-900">{t('Home','ទំព័រដើម')}</Link>
            <span className="text-gray-300">/</span>
            <Link href="/products" className="hover:text-gray-900">{t('Products','ផលិតផល')}</Link>
            <span className="text-gray-300">/</span>
            <Link href={`/products?category=${encodeURIComponent(product.category)}`} className="hover:text-gray-900">{product.category}</Link>
            <span className="text-gray-300">/</span>
            <span className="text-gray-700 truncate max-w-[150px]">{product.sku}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
            {/* Image */}
            <div className="relative">
              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden flex items-center justify-center p-6 sm:p-10 aspect-square cursor-zoom-in" onClick={() => setFullscreen(true)}>
                <img src={product.image} alt={cleanText(product.name)} className="max-w-full max-h-full object-contain hover:scale-105 transition-transform duration-300" onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg' }} />
              </div>
              <div className="absolute top-4 left-4">
                {product.status === 'Available' && product.qty > 0 && <span className="badge badge-success">{t('In Stock','មានក្នុងស្តុក')}</span>}
                {product.status === 'Out of Stock' && <span className="badge badge-danger">{t('Out of Stock','អស់ពីស្តុក')}</span>}
                {product.status === 'Low Stock' && <span className="badge badge-warning">{t('Low Stock','ស្តុកទាប')}</span>}
                {product.status === 'Price List' && <span className="badge badge-info">{t('Available','មាន')}</span>}
              </div>
            </div>

            {/* Info */}
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-[var(--color-primary)] uppercase tracking-wider">{product.brand}</span>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mt-2 leading-tight">{cleanText(product.name)}</h1>
              <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                <span>{product.category}</span><span>•</span><span className="font-mono">SKU: {product.sku}</span>
              </div>
              <div className="mt-6 pb-6 border-b border-gray-100">
                <span className="text-3xl font-bold text-gray-900">{formatPrice(product.price)}</span>
                {product.qty > 0 && <span className="text-sm text-gray-500 ml-3">{product.qty} {t('available','មាន')}</span>}
              </div>
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">{t('Description','ការពិពណ៌នា')}</h3>
                {hasRealDescription ? (
                  desc.type === 'list' ? (
                    <ul className="space-y-1.5">{desc.content.map((item, i) => (<li key={i} className="flex gap-2 text-sm text-gray-600"><span className="text-[var(--color-primary)] mt-1 shrink-0">•</span><span>{cleanText(item)}</span></li>))}</ul>
                  ) : (<p className="text-sm text-gray-600 leading-relaxed">{cleanText(desc.content[0] || '')}</p>)
                ) : (
                  <p className="text-sm text-gray-400 italic">{t('Detailed product information is being updated. Contact our sales team for specifications and availability.','ព័ត៌មានលម្អិតរបស់ផលិតផលកំពុងត្រូវបានធ្វើបច្ចុប្បន្នភាព។ សូមទាក់ទងក្រុមការងារផ្នែកលក់។')}</p>
                )}
              </div>
              <div className="mt-8 pt-6 border-t border-gray-100">
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-sm text-gray-600">{t('Quantity','ចំនួន')}:</span>
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                    <button onClick={() => setQty(q => Math.max(1, q-1))} className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-50 text-lg">−</button>
                    <span className="w-10 h-9 flex items-center justify-center text-sm font-semibold border-x border-gray-200">{qty}</span>
                    <button onClick={() => setQty(q => q+1)} className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-50 text-lg">+</button>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setShowConfirm(true)} className="btn-primary flex-1 py-3 text-sm">{t('Order Now','បញ្ជាទិញឥឡូវ')}</button>
                  <a href="https://t.me/SANGHAMEUK" target="_blank" rel="noopener noreferrer" className="btn-secondary py-3 text-sm px-4">{t('Contact Sales','ទាក់ទងផ្នែកលក់')}</a>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-16"><ProductSpecifications brand={product.brand} category={product.category} sku={product.sku} status={product.status} qty={product.qty} description={product.description} /></div>

          {related.length > 0 && (
            <section className="mb-16 pt-8 border-t border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-6">{t('Related Products','ផលិតផលទាក់ទង')}</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">{related.map(p => <ProductCard key={p.id} product={p} />)}</div>
            </section>
          )}

          {recentProducts.length > 0 && (
            <section className="pt-8 border-t border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-6">{t('Recently Viewed','បានមើលថ្មីៗ')}</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">{recentProducts.map(p => <ProductCard key={p.id} product={p} />)}</div>
            </section>
          )}
        </div>
      </main>

      {fullscreen && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4" onClick={() => setFullscreen(false)}>
          <button className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full text-white" aria-label="Close">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
          <img src={product.image} alt={product.name} className="max-w-full max-h-full object-contain" onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg' }} />
        </div>
      )}

      {showConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setShowConfirm(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl animate-scale-in" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 mb-4">{t('Confirm Order','បញ្ជាក់ការបញ្ជាទិញ')}</h3>
            <div className="flex gap-3 p-3 bg-gray-50 rounded-xl mb-4">
              <img src={product.image} alt="" className="w-14 h-14 rounded-lg object-contain bg-white border border-gray-100" onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg' }} />
              <div className="min-w-0"><p className="text-xs font-semibold text-[var(--color-primary)]">{product.brand}</p><p className="text-sm font-medium truncate">{cleanText(product.name)}</p><p className="text-xs text-gray-500 font-mono">{product.sku}</p></div>
            </div>
            <div className="flex justify-between items-center py-3 border-t border-b border-gray-100 mb-4">
              <span className="text-sm text-gray-600">{qty} × {formatPrice(product.price)}</span>
              <span className="text-lg font-bold text-gray-900">{formatPrice(product.price * qty)}</span>
            </div>
            <button onClick={handleOrder} className="w-full btn-primary py-3 text-sm mb-2">✈️ {t('Send via Telegram','ផ្ញើតាម Telegram')}</button>
            <button onClick={() => setShowConfirm(false)} className="w-full text-center text-sm text-gray-500 hover:text-gray-700 py-2">{t('Cancel','បោះបង់')}</button>
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 flex gap-2 lg:hidden z-40">
        <span className="text-lg font-bold text-gray-900 self-center">{formatPrice(product.price)}</span>
        <button onClick={() => setShowConfirm(true)} className="btn-primary flex-1 py-2.5 text-sm">{t('Order Now','បញ្ជាទិញ')}</button>
      </div>
      <div className="h-16 lg:hidden" />

      <Footer />
    </div>
  )
}
