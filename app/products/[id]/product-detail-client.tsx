'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { MessageCircle, Minus, Plus, ShoppingBag, X, ZoomIn } from 'lucide-react'
import { useApp } from '@/components/app-context'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ProductCard } from '@/components/product-card'
import { ProductSpecifications } from '@/components/product-specifications'
import { cleanText, isGenericDescription, parseDescription, addToRecentlyViewed, getRecentlyViewed } from '@/lib/product-utils'
import type { StorefrontProduct } from '@/lib/product-service'

interface Props {
  product: StorefrontProduct
  related: StorefrontProduct[]
}

const TELEGRAM_URL = 'https://t.me/SANGHAMEUK'

function getMaxQty(product: StorefrontProduct) {
  return product.qty > 0 && product.status === 'Available' ? product.qty : 99
}

function stockBadge(product: StorefrontProduct, t: (en: string, km: string) => string) {
  if (product.status === 'Out of Stock') return { label: t('Out of Stock', 'អស់ពីស្តុក'), className: 'badge-danger' }
  if (product.status === 'Low Stock') return { label: t('Low Stock', 'ស្តុកតិច'), className: 'badge-warning' }
  if (product.status === 'Available' && product.qty > 0) return { label: t('In Stock', 'មានក្នុងស្តុក'), className: 'badge-success' }
  return { label: t('Available', 'មាន'), className: 'badge-info' }
}

export function ProductDetailClient({ product, related }: Props) {
  const { formatPrice, t, lang, currency } = useApp()
  const [showConfirm, setShowConfirm] = useState(false)
  const [qty, setQty] = useState(1)
  const [fullscreen, setFullscreen] = useState(false)
  const [recentProducts, setRecentProducts] = useState<StorefrontProduct[]>([])
  const orderButtonRef = useRef<HTMLButtonElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  const maxQty = getMaxQty(product)
  const badge = stockBadge(product, t)

  useEffect(() => {
    setQty(1)
    addToRecentlyViewed(product.id)
    const ids = getRecentlyViewed().filter(id => id !== product.id).slice(0, 4)
    if (!ids.length) {
      setRecentProducts([])
      return
    }
    const controller = new AbortController()
    fetch('/api/products/by-ids', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids }),
      signal: controller.signal,
    })
      .then(response => {
        if (!response.ok) throw new Error('Fetch failed')
        return response.json()
      })
      .then(data => {
        if (data.products) setRecentProducts(data.products)
      })
      .catch(() => {})
    return () => controller.abort()
  }, [product.id])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setFullscreen(false)
        setShowConfirm(false)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    if (!showConfirm) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const focusableSelector = 'button:not([disabled]), a[href], input:not([disabled]), [tabindex]:not([tabindex="-1"])'
    const focusable = () => Array.from(modalRef.current?.querySelectorAll<HTMLElement>(focusableSelector) || [])
    focusable()[0]?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowConfirm(false)
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
      orderButtonRef.current?.focus()
    }
  }, [showConfirm])

  const desc = parseDescription(product.description)
  const hasRealDescription = !isGenericDescription(product.description)
  const productUrl = typeof window !== 'undefined' ? window.location.href : `https://store.vlasersolution.com/products/${product.id}`
  const totalDisplay = formatPrice(product.price * qty)
  const unitDisplay = formatPrice(product.price)

  const changeQty = (delta: number) => {
    setQty(current => Math.min(maxQty, Math.max(1, current + delta)))
  }

  const handleOrder = () => {
    const msg = lang === 'km'
      ? [
          'សំណើបញ្ជាទិញ',
          '----------------',
          `ផលិតផល: ${product.name}`,
          `SKU: ${product.sku}`,
          `ម៉ាក: ${product.brand}`,
          `ចំនួន: ${qty}`,
          `តម្លៃ: ${unitDisplay} x ${qty} = ${totalDisplay}`,
          `រូបិយប័ណ្ណបង្ហាញ: ${currency}`,
          `URL: ${productUrl}`,
          '----------------',
          'សួស្តី! ខ្ញុំចង់បញ្ជាទិញផលិតផលនេះ។',
        ].join('\n')
      : [
          'Order Request',
          '----------------',
          `Product: ${product.name}`,
          `SKU: ${product.sku}`,
          `Brand: ${product.brand}`,
          `Quantity: ${qty}`,
          `Price: ${unitDisplay} x ${qty} = ${totalDisplay}`,
          `Display currency: ${currency}`,
          `URL: ${productUrl}`,
          '----------------',
          'Hi! I would like to order this product.',
        ].join('\n')
    window.open(`${TELEGRAM_URL}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer')
    setShowConfirm(false)
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-grow">
        <div className="container-page py-5 sm:py-8">
          <nav className="mb-5 flex min-w-0 items-center gap-1.5 text-xs text-gray-500 sm:mb-6">
            <Link href="/" className="hover:text-gray-950 focus-ring rounded-md">{t('Home', 'ទំព័រដើម')}</Link>
            <span className="text-gray-300">/</span>
            <Link href="/products" className="hover:text-gray-950 focus-ring rounded-md">{t('Products', 'ផលិតផល')}</Link>
            <span className="text-gray-300">/</span>
            <Link href={`/products?category=${encodeURIComponent(product.category)}`} className="hidden hover:text-gray-950 focus-ring rounded-md sm:inline">{product.category}</Link>
            <span className="hidden text-gray-300 sm:inline">/</span>
            <span className="truncate text-gray-700">{product.sku}</span>
          </nav>

          <div className="grid grid-cols-1 gap-7 lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.9fr)] lg:gap-12">
            <div className="relative">
              <button
                type="button"
                onClick={() => setFullscreen(true)}
                className="group relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-3xl border border-gray-200 bg-gray-50 p-6 transition-shadow duration-300 hover:shadow-lg focus-ring sm:p-10"
                aria-label={t('Open product image viewer', 'បើកមើលរូបភាពផលិតផល')}
              >
                <img src={product.image} alt={cleanText(product.name)} className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-[1.025]" onError={event => { (event.currentTarget as HTMLImageElement).src = '/placeholder.svg' }} />
                <span className={`badge ${badge.className} absolute left-4 top-4 shadow-sm`}>{badge.label}</span>
                <span className="absolute bottom-4 right-4 hidden items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-gray-700 shadow-sm sm:flex">
                  <ZoomIn className="size-3.5" aria-hidden="true" />
                  {t('Zoom', 'ពង្រីក')}
                </span>
              </button>
            </div>

            <section className="min-w-0 lg:pt-2">
              <p className="text-xs font-black uppercase tracking-wider text-[var(--color-primary)]">{product.brand}</p>
              <h1 className="mt-2 max-w-full break-words text-2xl font-black leading-tight tracking-tight text-gray-950 sm:text-3xl lg:text-4xl [overflow-wrap:anywhere]">{cleanText(product.name)}</h1>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                <Link href={`/products?category=${encodeURIComponent(product.category)}`} className="rounded-full bg-gray-50 px-2.5 py-1 font-semibold text-gray-700 hover:bg-gray-100 focus-ring">{product.category}</Link>
                <span className="rounded-full bg-gray-50 px-2.5 py-1 font-mono">SKU: {product.sku}</span>
              </div>

              <div className="mt-6 rounded-3xl border border-gray-100 bg-gray-50/60 p-4 sm:p-5">
                <div className="flex flex-wrap items-end justify-between gap-3 border-b border-gray-100 pb-5">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500">{t('Unit price', 'តម្លៃក្នុងមួយឯកតា')}</p>
                    <p className="mt-1 text-3xl font-black text-gray-950">{unitDisplay}</p>
                  </div>
                  {product.qty > 0 && <span className="text-sm font-semibold text-gray-500">{product.qty} {t('available', 'មាន')}</span>}
                </div>

                <div className="pt-5">
                  <label className="mb-2 block text-sm font-bold text-gray-950" htmlFor="quantity-display">{t('Quantity', 'ចំនួន')}</label>
                  <div className="flex items-center gap-3">
                    <div className="inline-flex overflow-hidden rounded-2xl border border-gray-200 bg-white">
                      <button type="button" onClick={() => changeQty(-1)} disabled={qty <= 1} className="tap-target inline-flex items-center justify-center text-gray-700 hover:bg-gray-50 disabled:opacity-40 focus-ring" aria-label={t('Decrease quantity', 'បន្ថយចំនួន')}><Minus className="size-4" /></button>
                      <output id="quantity-display" className="flex h-11 min-w-12 items-center justify-center border-x border-gray-200 px-4 text-sm font-black">{qty}</output>
                      <button type="button" onClick={() => changeQty(1)} disabled={qty >= maxQty} className="tap-target inline-flex items-center justify-center text-gray-700 hover:bg-gray-50 disabled:opacity-40 focus-ring" aria-label={t('Increase quantity', 'បន្ថែមចំនួន')}><Plus className="size-4" /></button>
                    </div>
                    <p className="text-xs text-gray-500">{t('Total', 'សរុប')}: <span className="font-black text-gray-950">{totalDisplay}</span></p>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]">
                  <button ref={orderButtonRef} onClick={() => setShowConfirm(true)} className="btn-primary h-12 w-full text-sm">
                    <ShoppingBag className="size-4" aria-hidden="true" />
                    {t('Order Now', 'បញ្ជាទិញឥឡូវ')}
                  </button>
                  <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer" className="btn-secondary h-12 px-5 text-sm">
                    <MessageCircle className="size-4" aria-hidden="true" />
                    {t('Contact Sales', 'ទាក់ទងផ្នែកលក់')}
                  </a>
                </div>
              </div>

              <div className="mt-7">
                <h2 className="text-base font-black text-gray-950">{t('Description', 'ការពិពណ៌នា')}</h2>
                {hasRealDescription ? (
                  desc.type === 'list' ? (
                    <ul className="mt-3 space-y-2">
                      {desc.content.map((item, index) => (
                        <li key={index} className="flex gap-2 text-sm leading-7 text-gray-600">
                          <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[var(--color-primary)]" />
                          <span>{cleanText(item)}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-3 text-sm leading-7 text-gray-600">{cleanText(desc.content[0] || '')}</p>
                  )
                ) : (
                  <p className="mt-3 text-sm leading-7 text-gray-500">{t('Detailed product information is being updated. Contact our sales team for specifications and availability.', 'ព័ត៌មានលម្អិតរបស់ផលិតផលកំពុងត្រូវបានធ្វើបច្ចុប្បន្នភាព។ សូមទាក់ទងផ្នែកលក់សម្រាប់លក្ខណៈបច្ចេកទេស និងស្តុក។')}</p>
                )}
              </div>
            </section>
          </div>

          <section className="mt-12 sm:mt-16">
            <ProductSpecifications brand={product.brand} category={product.category} sku={product.sku} status={product.status} qty={product.qty} description={product.description} />
          </section>

          {related.length > 0 && (
            <section className="mt-14 border-t border-gray-100 pt-8 sm:mt-16">
              <div className="mb-6 flex items-end justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-gray-950">{t('Related Products', 'ផលិតផលពាក់ព័ន្ធ')}</h2>
                  <p className="mt-1 text-sm text-gray-500">{t('Similar products from the live catalog.', 'ផលិតផលស្រដៀងគ្នាពីបញ្ជីបច្ចុប្បន្ន។')}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">{related.map(item => <ProductCard key={item.id} product={item} />)}</div>
            </section>
          )}

          {recentProducts.length > 0 && (
            <section className="mt-14 border-t border-gray-100 pt-8">
              <h2 className="text-xl font-black text-gray-950">{t('Recently Viewed', 'បានមើលថ្មីៗ')}</h2>
              <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">{recentProducts.map(item => <ProductCard key={item.id} product={item} />)}</div>
            </section>
          )}
        </div>
      </main>

      {fullscreen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 p-4 animate-fade-in" onClick={() => setFullscreen(false)} role="dialog" aria-modal="true" aria-label={t('Product image viewer', 'មើលរូបភាពផលិតផល')}>
          <button type="button" className="absolute right-4 top-4 tap-target inline-flex items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus-ring" aria-label={t('Close image viewer', 'បិទរូបភាព')}>
            <X className="size-5" />
          </button>
          <img src={product.image} alt={product.name} className="max-h-full max-w-full object-contain animate-scale-in" onError={event => { (event.currentTarget as HTMLImageElement).src = '/placeholder.svg' }} />
        </div>
      )}

      {showConfirm && (
        <div className="fixed inset-0 z-[120] flex items-end justify-center p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-labelledby="order-title">
          <button type="button" className="absolute inset-0 bg-black/45 backdrop-blur-[2px] animate-fade-in" onClick={() => setShowConfirm(false)} aria-label={t('Close order review', 'បិទការពិនិត្យបញ្ជាទិញ')} />
          <div ref={modalRef} className="relative w-full rounded-t-3xl bg-white p-5 shadow-xl animate-sheet-in sm:max-w-md sm:rounded-3xl sm:p-6">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary)]">{t('Telegram checkout', 'បន្តតាម Telegram')}</p>
                <h2 id="order-title" className="mt-1 text-xl font-black text-gray-950">{t('Review order request', 'ពិនិត្យសំណើបញ្ជាទិញ')}</h2>
              </div>
              <button type="button" onClick={() => setShowConfirm(false)} className="tap-target inline-flex items-center justify-center rounded-xl text-gray-500 hover:bg-gray-50 focus-ring" aria-label={t('Cancel', 'បោះបង់')}><X className="size-5" /></button>
            </div>

            <div className="flex gap-3 rounded-2xl bg-gray-50 p-3">
              <img src={product.image} alt="" className="size-16 shrink-0 rounded-xl border border-gray-100 bg-white object-contain p-1.5" onError={event => { (event.currentTarget as HTMLImageElement).src = '/placeholder.svg' }} />
              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-wider text-[var(--color-primary)]">{product.brand}</p>
                <p className="mt-1 line-clamp-2 text-sm font-bold leading-5 text-gray-950">{cleanText(product.name)}</p>
                <p className="mt-1 text-xs font-mono text-gray-500">SKU: {product.sku}</p>
              </div>
            </div>

            <dl className="mt-4 divide-y divide-gray-100 rounded-2xl border border-gray-100">
              <div className="flex items-center justify-between gap-4 px-4 py-3 text-sm"><dt className="text-gray-500">{t('Quantity', 'ចំនួន')}</dt><dd className="font-bold text-gray-950">{qty}</dd></div>
              <div className="flex items-center justify-between gap-4 px-4 py-3 text-sm"><dt className="text-gray-500">{t('Unit price', 'តម្លៃក្នុងមួយឯកតា')}</dt><dd className="font-bold text-gray-950">{unitDisplay}</dd></div>
              <div className="flex items-center justify-between gap-4 px-4 py-3 text-sm"><dt className="text-gray-500">{t('Total', 'សរុប')}</dt><dd className="text-lg font-black text-gray-950">{totalDisplay}</dd></div>
              <div className="flex items-center justify-between gap-4 px-4 py-3 text-sm"><dt className="text-gray-500">{t('Currency', 'រូបិយប័ណ្ណ')}</dt><dd className="font-bold text-gray-950">{currency}</dd></div>
            </dl>

            <p className="mt-4 text-sm leading-6 text-gray-500">{t('Checkout continues in Telegram. You can review and send the prepared message there.', 'ការបញ្ជាទិញនឹងបន្តនៅក្នុង Telegram។ អ្នកអាចពិនិត្យ និងផ្ញើសារដែលបានរៀបចំនៅទីនោះ។')}</p>
            <button onClick={handleOrder} className="btn-primary mt-5 h-12 w-full text-sm">
              <MessageCircle className="size-4" aria-hidden="true" />
              {t('Send through Telegram', 'ផ្ញើតាម Telegram')}
            </button>
            <button onClick={() => setShowConfirm(false)} className="mt-2 h-11 w-full rounded-xl text-sm font-bold text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-800 focus-ring">{t('Cancel', 'បោះបង់')}</button>
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white/95 p-3 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          <div className="min-w-0">
            <p className="text-xs text-gray-500">{t('Total', 'សរុប')}</p>
            <p className="text-lg font-black leading-none text-gray-950">{totalDisplay}</p>
          </div>
          <button onClick={() => setShowConfirm(true)} className="btn-primary h-12 flex-1 text-sm">
            <ShoppingBag className="size-4" aria-hidden="true" />
            {t('Order Now', 'បញ្ជាទិញ')}
          </button>
        </div>
      </div>
      <div className="h-20 lg:hidden" />

      <Footer />
    </div>
  )
}
