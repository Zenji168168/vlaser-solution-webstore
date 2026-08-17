'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { AlertCircle, CheckCircle2, Loader2, MessageCircle, Minus, Plus, QrCode, ShoppingBag, X, ZoomIn } from 'lucide-react'
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
const KHR_RATE = 4100

type PaymentMethod = 'khqr' | 'telegram' | null
type KhqrStatus = 'idle' | 'creating' | 'qr' | 'paid' | 'setup_required' | 'error' | 'expired'

interface KhqrPayment {
  qrImage: string
  md5: string
  billNumber: string
  amount: string
  currency: 'KHR' | 'USD'
  expiresAt: string
  syncAvailable: boolean
}

function getMaxQty(product: StorefrontProduct) {
  return product.qty > 0 && product.status === 'Available' ? product.qty : 99
}

function stockBadge(product: StorefrontProduct, t: (en: string, km: string) => string) {
  if (product.status === 'Out of Stock') return { label: t('Out of Stock', 'អស់ពីស្តុក'), className: 'badge-danger' }
  if (product.status === 'Low Stock') return { label: t('Low Stock', 'ស្តុកតិច'), className: 'badge-warning' }
  if (product.status === 'Available' && product.qty > 0) return { label: t('Available', 'មាន'), className: 'badge-success' }
  return { label: t('Available', 'មាន'), className: 'badge-info' }
}

export function ProductDetailClient({ product, related }: Props) {
  const { formatPrice, t, lang, currency } = useApp()
  const [showConfirm, setShowConfirm] = useState(false)
  const [qty, setQty] = useState(1)
  const [fullscreen, setFullscreen] = useState(false)
  const [activeImage, setActiveImage] = useState(product.image)
  const [recentProducts, setRecentProducts] = useState<StorefrontProduct[]>([])
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(null)
  const [khqrStatus, setKhqrStatus] = useState<KhqrStatus>('idle')
  const [khqrPayment, setKhqrPayment] = useState<KhqrPayment | null>(null)
  const [khqrMessage, setKhqrMessage] = useState('')
  const [khqrRemainingSeconds, setKhqrRemainingSeconds] = useState(0)
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [phoneHasTelegram, setPhoneHasTelegram] = useState<'yes' | 'no'>('yes')
  const orderButtonRef = useRef<HTMLButtonElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  const maxQty = getMaxQty(product)
  const badge = stockBadge(product, t)

  useEffect(() => {
    setQty(1)
    setActiveImage(product.image)
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

  useEffect(() => {
    if (showConfirm) return
    setPaymentMethod(null)
    setKhqrStatus('idle')
    setKhqrPayment(null)
    setKhqrMessage('')
    setKhqrRemainingSeconds(0)
  }, [showConfirm])

  const desc = parseDescription(product.description)
  const hasRealDescription = !isGenericDescription(product.description)
  const productUrl = typeof window !== 'undefined' ? window.location.href : `https://store.vlasersolution.com/products/${product.id}`
  const totalDisplay = formatPrice(product.price * qty)
  const unitDisplay = formatPrice(product.price)
  const productImages = Array.from(new Set([product.image].filter(Boolean)))
  const khqrAmount = currency === 'KHR' ? Math.round(product.price * qty * KHR_RATE) : Number((product.price * qty).toFixed(2))
  const normalizedCustomerName = customerName.trim()
  const normalizedCustomerPhone = customerPhone.trim()
  const canChoosePayment = normalizedCustomerName.length >= 2 && /^[0-9+()\-\s]{7,20}$/.test(normalizedCustomerPhone)
  const khqrRemainingMinutes = Math.floor(khqrRemainingSeconds / 60)
  const khqrRemainingPartialSeconds = khqrRemainingSeconds % 60
  const khqrCountdown = `${khqrRemainingMinutes}:${khqrRemainingPartialSeconds.toString().padStart(2, '0')}`
  const khqrProgress = khqrPayment ? Math.max(0, Math.min(100, (khqrRemainingSeconds / 600) * 100)) : 0

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
          `ឈ្មោះអតិថិជន: ${normalizedCustomerName}`,
          `លេខទូរស័ព្ទ: ${normalizedCustomerPhone}`,
          `លេខនេះមាន Telegram: ${phoneHasTelegram === 'yes' ? 'មាន' : 'មិនមាន'}`,
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
          `Customer name: ${normalizedCustomerName}`,
          `Phone: ${normalizedCustomerPhone}`,
          `Phone has Telegram: ${phoneHasTelegram === 'yes' ? 'Yes' : 'No'}`,
          `URL: ${productUrl}`,
          '----------------',
          'Hi! I would like to order this product.',
        ].join('\n')
    window.open(`${TELEGRAM_URL}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer')
    setShowConfirm(false)
  }

  const createKhqrPayment = async () => {
    setKhqrStatus('creating')
    setKhqrMessage('')
    setKhqrPayment(null)

    try {
      const response = await fetch('/api/bakong/khqr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          amount: khqrAmount,
          currency,
          quantity: qty,
          customerName: normalizedCustomerName,
          customerPhone: normalizedCustomerPhone,
          phoneHasTelegram: phoneHasTelegram === 'yes',
        }),
      })
      const data = await response.json().catch(() => null)

      if (!response.ok) {
        setKhqrStatus(response.status === 503 ? 'setup_required' : 'error')
        setKhqrMessage(data?.error || t('KHQR payment could not start. Please try again.', 'មិនអាចចាប់ផ្តើមការទូទាត់ KHQR បានទេ។ សូមព្យាយាមម្តងទៀត។'))
        return
      }

      setKhqrPayment(data)
      setKhqrStatus('qr')
      setKhqrRemainingSeconds(Math.max(0, Math.ceil((new Date(data.expiresAt).getTime() - Date.now()) / 1000)))
    } catch {
      setKhqrStatus('error')
      setKhqrMessage(t('KHQR payment could not start. Please try again.', 'មិនអាចចាប់ផ្តើមការទូទាត់ KHQR បានទេ។ សូមព្យាយាមម្តងទៀត។'))
    }
  }

  useEffect(() => {
    if (!showConfirm || !canChoosePayment || paymentMethod !== 'khqr' || khqrStatus !== 'idle') return
    void createKhqrPayment()
  }, [showConfirm, canChoosePayment, paymentMethod, khqrStatus])

  useEffect(() => {
    if (!showConfirm || !khqrPayment || khqrStatus === 'paid') return
    const updateRemaining = () => {
      const remaining = Math.max(0, Math.ceil((new Date(khqrPayment.expiresAt).getTime() - Date.now()) / 1000))
      setKhqrRemainingSeconds(remaining)
      if (remaining === 0) setKhqrStatus(current => current === 'paid' ? 'paid' : 'expired')
    }

    updateRemaining()
    const timer = window.setInterval(updateRemaining, 1000)
    return () => window.clearInterval(timer)
  }, [showConfirm, khqrPayment, khqrStatus])

  useEffect(() => {
    if (!showConfirm || paymentMethod !== 'khqr' || !khqrPayment || !khqrPayment.syncAvailable) return
    if (khqrStatus !== 'qr') return

    let stopped = false
    const expiresAt = new Date(khqrPayment.expiresAt).getTime()

    const checkStatus = async () => {
      if (stopped) return
      if (Date.now() > expiresAt) {
        setKhqrStatus('expired')
        return
      }

      try {
        const response = await fetch('/api/bakong/status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ md5: khqrPayment.md5 }),
        })
        const data = await response.json().catch(() => null)
        if (!response.ok) {
          if (response.status === 503) setKhqrStatus('setup_required')
          return
        }
        if (data?.paid || data?.status === 'paid') setKhqrStatus('paid')
      } catch {
        return
      }
    }

    const timer = window.setInterval(checkStatus, 3500)
    const firstCheck = window.setTimeout(checkStatus, 1800)

    return () => {
      stopped = true
      window.clearInterval(timer)
      window.clearTimeout(firstCheck)
    }
  }, [showConfirm, paymentMethod, khqrPayment, khqrStatus])

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-grow">
        <div className="container-page py-6 sm:py-10">
          <nav className="mb-5 flex min-w-0 items-center gap-1.5 text-xs text-gray-500 sm:mb-6">
            <Link href="/" className="hover:text-gray-950 focus-ring rounded-md">{t('Home', 'ទំព័រដើម')}</Link>
            <span className="text-gray-300">/</span>
            <Link href="/products" className="hover:text-gray-950 focus-ring rounded-md">{t('Products', 'ផលិតផល')}</Link>
            <span className="text-gray-300">/</span>
            <Link href={`/products?category=${encodeURIComponent(product.category)}`} className="hidden hover:text-gray-950 focus-ring rounded-md sm:inline">{product.category}</Link>
            <span className="hidden text-gray-300 sm:inline">/</span>
            <span className="truncate text-gray-700">{product.sku}</span>
          </nav>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,0.98fr)_minmax(420px,0.9fr)] lg:gap-10">
            <div className="relative">
              <button
                type="button"
                onClick={() => setFullscreen(true)}
                className="group relative flex aspect-[1.04/1] w-full items-center justify-center overflow-hidden rounded-[2rem] border border-black/[0.07] bg-[linear-gradient(180deg,#fbfdff_0%,#eef3f4_100%)] p-5 transition-all duration-200 hover:shadow-md focus-ring sm:p-8 lg:p-9"
                aria-label={t('Open product image viewer', 'បើកមើលរូបភាពផលិតផល')}
              >
                <div className="absolute inset-x-14 bottom-8 h-12 rounded-full bg-black/10 blur-3xl" aria-hidden="true" />
                <img src={activeImage} alt={cleanText(product.name)} className="relative max-h-[88%] max-w-[90%] object-contain transition-transform duration-200 group-hover:scale-[1.015]" onError={event => { (event.currentTarget as HTMLImageElement).src = '/placeholder.svg' }} />
                <span className={`badge ${badge.className} absolute left-4 top-4 shadow-sm`}>{badge.label}</span>
                <span className="absolute bottom-4 right-4 hidden items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-gray-700 shadow-sm sm:flex">
                  <ZoomIn className="size-3.5" aria-hidden="true" />
                  {t('Zoom', 'ពង្រីក')}
                </span>
              </button>
              <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
                {productImages.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() => setActiveImage(image)}
                    className={`flex size-20 shrink-0 items-center justify-center rounded-2xl border-2 bg-white p-2 transition-all duration-200 focus-ring ${activeImage === image ? 'border-[var(--color-primary)] shadow-sm ring-2 ring-cyan-100' : 'border-transparent ring-1 ring-black/[0.08] hover:border-cyan-200 hover:ring-cyan-100'}`}
                    aria-label={t('Show product image', 'បង្ហាញរូបភាពផលិតផល')}
                  >
                    <img src={image} alt="" className="max-h-full max-w-full object-contain" onError={event => { (event.currentTarget as HTMLImageElement).src = '/placeholder.svg' }} />
                  </button>
                ))}
              </div>
            </div>

            <section className="min-w-0 lg:sticky lg:top-24 lg:self-start">
              <p className="text-xs font-black uppercase tracking-wider text-[var(--color-primary)]">{product.brand}</p>
              <h1 className="mt-2 max-w-full break-words text-3xl font-black leading-tight tracking-tight text-[var(--color-ink)] sm:text-4xl lg:text-5xl [overflow-wrap:anywhere]">{cleanText(product.name)}</h1>
              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                <Link href={`/products?category=${encodeURIComponent(product.category)}`} className="rounded-full bg-gray-50 px-2.5 py-1 font-semibold text-gray-700 hover:bg-gray-100 focus-ring">{product.category}</Link>
                <span className="rounded-full bg-gray-50 px-2.5 py-1 font-mono">SKU: {product.sku}</span>
              </div>

              <div className="mt-7 rounded-[1.5rem] border border-black/[0.06] bg-white p-4 shadow-sm sm:p-5">
                <div className="flex flex-wrap items-end justify-between gap-4 border-b border-gray-100 pb-6">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500">{t('Unit price', 'តម្លៃក្នុងមួយឯកតា')}</p>
                    <p className="mt-2 text-4xl font-black tracking-tight text-[var(--color-ink)]">{unitDisplay}</p>
                  </div>
                  {product.qty > 0 && <span className="text-sm font-semibold text-gray-500">{product.qty} {t('available', 'មាន')}</span>}
                </div>

                <div className="pt-6">
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

                <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto]">
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

              <div className="mt-8">
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
              <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">{related.map(item => <ProductCard key={item.id} product={item} />)}</div>
            </section>
          )}

          {recentProducts.length > 0 && (
            <section className="mt-14 border-t border-gray-100 pt-8">
              <h2 className="text-xl font-black text-gray-950">{t('Recently Viewed', 'បានមើលថ្មីៗ')}</h2>
              <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">{recentProducts.map(item => <ProductCard key={item.id} product={item} />)}</div>
            </section>
          )}
        </div>
      </main>

      {fullscreen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 p-4 animate-fade-in" onClick={() => setFullscreen(false)} role="dialog" aria-modal="true" aria-label={t('Product image viewer', 'មើលរូបភាពផលិតផល')}>
          <button type="button" className="absolute right-4 top-4 tap-target inline-flex items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus-ring" aria-label={t('Close image viewer', 'បិទរូបភាព')}>
            <X className="size-5" />
          </button>
          <img src={activeImage} alt={product.name} className="max-h-full max-w-full object-contain animate-scale-in" onError={event => { (event.currentTarget as HTMLImageElement).src = '/placeholder.svg' }} />
        </div>
      )}

      {showConfirm && (
        <div className="fixed inset-0 z-[120] flex items-end justify-center p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-labelledby="order-title">
          <button type="button" className="absolute inset-0 bg-black/45 backdrop-blur-[2px] animate-fade-in" onClick={() => setShowConfirm(false)} aria-label={t('Close order review', 'បិទការពិនិត្យបញ្ជាទិញ')} />
          <div ref={modalRef} className="relative max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white p-5 shadow-xl animate-sheet-in sm:max-w-lg sm:rounded-3xl sm:p-6">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary)]">{t('Secure checkout', 'ការទូទាត់សុវត្ថិភាព')}</p>
                <h2 id="order-title" className="mt-1 text-xl font-black text-gray-950">{t('Customer details', 'ព័ត៌មានអតិថិជន')}</h2>
              </div>
              <button type="button" onClick={() => setShowConfirm(false)} className="tap-target inline-flex items-center justify-center rounded-xl text-gray-500 hover:bg-gray-50 focus-ring" aria-label={t('Cancel', 'បោះបង់')}><X className="size-5" /></button>
            </div>

            <div className="mt-4 rounded-3xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="text-xs font-black uppercase tracking-wider text-gray-500">{t('Name', 'ឈ្មោះ')}</span>
                  <input
                    value={customerName}
                    onChange={event => setCustomerName(event.target.value)}
                    className="mt-1 h-12 w-full rounded-2xl border border-gray-200 px-4 text-sm font-semibold text-gray-950 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
                    placeholder={t('Your name', 'ឈ្មោះរបស់អ្នក')}
                    autoComplete="name"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-black uppercase tracking-wider text-gray-500">{t('Phone number', 'លេខទូរស័ព្ទ')}</span>
                  <input
                    value={customerPhone}
                    onChange={event => setCustomerPhone(event.target.value)}
                    className="mt-1 h-12 w-full rounded-2xl border border-gray-200 px-4 text-sm font-semibold text-gray-950 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
                    placeholder="010 123 456"
                    autoComplete="tel"
                    inputMode="tel"
                  />
                </label>
              </div>
              <fieldset className="mt-4">
                <legend className="text-xs font-black uppercase tracking-wider text-gray-500">{t('Does this phone number have Telegram?', 'លេខនេះមាន Telegram ឬទេ?')}</legend>
                <div className="mt-2 grid grid-cols-2 gap-2 rounded-2xl bg-gray-50 p-1.5">
                  <button type="button" onClick={() => setPhoneHasTelegram('yes')} className={`h-11 rounded-xl text-sm font-black transition-colors focus-ring ${phoneHasTelegram === 'yes' ? 'bg-white text-gray-950 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}>{t('Yes', 'មាន')}</button>
                  <button type="button" onClick={() => setPhoneHasTelegram('no')} className={`h-11 rounded-xl text-sm font-black transition-colors focus-ring ${phoneHasTelegram === 'no' ? 'bg-white text-gray-950 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}>{t('No', 'មិនមាន')}</button>
                </div>
              </fieldset>
              {!canChoosePayment && (
                <p className="mt-3 text-xs font-semibold text-amber-700">{t('Enter your name and phone number before choosing payment.', 'សូមបញ្ចូលឈ្មោះ និងលេខទូរស័ព្ទ មុនជ្រើសរើសការទូទាត់។')}</p>
              )}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 rounded-2xl bg-gray-50 p-1.5">
              <button
                type="button"
                onClick={() => {
                  if (!canChoosePayment) return
                  setPaymentMethod('khqr')
                  if (khqrStatus === 'idle' || khqrStatus === 'error' || khqrStatus === 'setup_required' || khqrStatus === 'expired') void createKhqrPayment()
                }}
                disabled={!canChoosePayment}
                className={`h-11 rounded-xl text-sm font-black transition-colors focus-ring disabled:cursor-not-allowed disabled:opacity-45 ${paymentMethod === 'khqr' ? 'bg-white text-gray-950 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
              >
                <QrCode className="mr-1.5 inline size-4 align-[-3px]" aria-hidden="true" />
                KHQR
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!canChoosePayment) return
                  setPaymentMethod('telegram')
                }}
                disabled={!canChoosePayment}
                className={`h-11 rounded-xl text-sm font-black transition-colors focus-ring disabled:cursor-not-allowed disabled:opacity-45 ${paymentMethod === 'telegram' ? 'bg-white text-gray-950 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
              >
                <MessageCircle className="mr-1.5 inline size-4 align-[-3px]" aria-hidden="true" />
                Telegram
              </button>
            </div>

            {paymentMethod === 'telegram' && (
              <>
                <div className="mt-4 flex gap-3 rounded-2xl bg-gray-50 p-3">
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
              </>
            )}

            {paymentMethod === 'khqr' ? (
              khqrStatus === 'creating' ? (
                <div className="mt-4 flex min-h-[360px] items-center justify-center rounded-[2rem] bg-white text-center shadow-sm ring-1 ring-gray-100">
                  <div>
                    <Loader2 className="mx-auto size-11 animate-spin text-cyan-500" aria-hidden="true" />
                    <p className="mt-5 text-lg font-black text-gray-950">{t('Preparing KHQR', 'កំពុងរៀបចំ KHQR')}</p>
                    <p className="mt-2 max-w-xs text-sm leading-6 text-gray-500">{t('Please wait while we create your secure payment QR.', 'សូមរង់ចាំ ខណៈយើងបង្កើត QR ទូទាត់សុវត្ថិភាពរបស់អ្នក។')}</p>
                  </div>
                </div>
              ) : (
              <div className="mt-4 overflow-hidden rounded-[2rem] border border-gray-100 bg-white shadow-sm">
                <div className="bg-[linear-gradient(135deg,#e61937_0%,#c8102e_50%,#7f1d1d_100%)] px-5 py-4 text-white">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-black uppercase tracking-wider text-white/75">Bakong KHQR</p>
                      <p className="mt-1 text-lg font-black">{t('Scan. Pay. Done.', 'ស្កេន។ បង់ប្រាក់។ រួចរាល់។')}</p>
                    </div>
                    <div className="rounded-2xl bg-white/15 px-3 py-2 text-right backdrop-blur">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-white/70">{t('Valid for', 'មានសុពលភាព')}</p>
                      <p className="font-mono text-lg font-black leading-none">{khqrPayment ? khqrCountdown : '10:00'}</p>
                    </div>
                  </div>
                  <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/20">
                    <div className="h-full rounded-full bg-white transition-[width] duration-500" style={{ width: `${khqrProgress}%` }} />
                  </div>
                </div>
                <div className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="mt-1 text-sm font-bold text-gray-950">{t('Waiting for payment', 'កំពុងរង់ចាំការទូទាត់')}</p>
                    <p className="mt-1 text-xs text-gray-500">{t('If you already scanned the QR, please confirm the payment in your banking app. We will show paid after Bakong confirms the transaction.', 'បើអ្នកបានស្កេន QR រួច សូមបញ្ជាក់ការទូទាត់ក្នុងកម្មវិធីធនាគារ។ យើងនឹងបង្ហាញបានទូទាត់ បន្ទាប់ពី Bakong បញ្ជាក់ប្រតិបត្តិការ។')}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black ${
                    khqrStatus === 'paid' ? 'bg-emerald-50 text-emerald-700' :
                    khqrStatus === 'setup_required' || khqrStatus === 'error' || khqrStatus === 'expired' ? 'bg-amber-50 text-amber-700' :
                    'bg-cyan-50 text-cyan-700'
                  }`}>
                    {khqrStatus === 'paid' && <CheckCircle2 className="size-3" aria-hidden="true" />}
                    {(khqrStatus === 'setup_required' || khqrStatus === 'error' || khqrStatus === 'expired') && <AlertCircle className="size-3" aria-hidden="true" />}
                    {khqrStatus === 'paid' ? t('Paid', 'បានទូទាត់') :
                      khqrStatus === 'setup_required' ? t('Setup required', 'ត្រូវការកំណត់') :
                      khqrStatus === 'expired' ? t('Expired', 'ផុតកំណត់') :
                      khqrStatus === 'error' ? t('Try again', 'ព្យាយាមម្តងទៀត') :
                      t('Waiting', 'កំពុងរង់ចាំ')}
                  </span>
                </div>

                {khqrPayment && khqrStatus === 'paid' ? (
                  <div className="flex min-h-[360px] items-center justify-center text-center">
                    <div>
                      <div className="mx-auto flex size-36 items-center justify-center rounded-[2rem] bg-emerald-50">
                        <CheckCircle2 className="size-20 text-emerald-500" aria-hidden="true" />
                      </div>
                      <h3 className="mt-8 text-2xl font-black text-gray-950">{t('Payment completed', 'បានទូទាត់')}</h3>
                      <p className="mx-auto mt-4 max-w-sm text-base leading-7 text-gray-600">{t('Payment received. Our sales team will confirm your order.', 'បានទទួលការទូទាត់។ ក្រុមលក់នឹងបញ្ជាក់ការបញ្ជាទិញរបស់អ្នក។')}</p>
                    </div>
                  </div>
                ) : khqrPayment && khqrStatus === 'qr' ? (
                  <div className="mt-4 text-center">
                    <div className="mx-auto flex max-w-[292px] items-center justify-center rounded-[1.75rem] border border-gray-100 bg-white p-3 shadow-[0_18px_50px_rgba(15,23,42,0.10)]">
                      <img src={khqrPayment.qrImage} alt={t('Bakong KHQR payment code', 'កូដទូទាត់ Bakong KHQR')} className="h-auto w-full rounded-2xl" />
                    </div>
                    <div className="mx-auto mt-4 grid max-w-[292px] grid-cols-2 overflow-hidden rounded-2xl border border-gray-100 text-left">
                      <div className="border-r border-gray-100 p-3">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{t('Reference', 'លេខយោង')}</p>
                        <p className="mt-1 truncate font-mono text-xs font-bold text-gray-700">{khqrPayment.billNumber}</p>
                      </div>
                      <div className="p-3 text-right">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{t('Amount', 'ចំនួនទឹកប្រាក់')}</p>
                        <p className="mt-1 text-sm font-black text-gray-950">{khqrPayment.amount} {khqrPayment.currency}</p>
                      </div>
                    </div>
                    <p className="mt-2 text-xs leading-5 text-gray-500">
                      {khqrPayment.syncAvailable
                          ? t('QR is ready. If you already scanned it, approve the payment in your banking app.', 'QR រួចរាល់។ បើអ្នកបានស្កេនរួច សូមអនុម័តការទូទាត់ក្នុងកម្មវិធីធនាគារ។')
                          : t('KHQR is ready, but automatic payment sync needs setup.', 'KHQR រួចរាល់ ប៉ុន្តែការធ្វើសមកាលកម្មការទូទាត់ស្វ័យប្រវត្តិត្រូវការកំណត់។')}
                    </p>
                    <div className="mx-auto mt-4 flex max-w-[292px] items-center justify-center gap-2 rounded-2xl bg-cyan-50 px-4 py-3 text-sm font-bold text-cyan-800">
                      <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                      {t('Waiting for Bakong payment confirmation...', 'កំពុងរង់ចាំការបញ្ជាក់ការទូទាត់ពី Bakong...')}
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 flex min-h-40 items-center justify-center rounded-3xl bg-gray-50 p-5 text-center">
                    <div>
                      <AlertCircle className="mx-auto size-8 text-amber-600" aria-hidden="true" />
                      <p className="mt-3 text-sm font-bold text-gray-950">
                        {khqrMessage || t('KHQR payment could not start. Please try again.', 'មិនអាចចាប់ផ្តើមការទូទាត់ KHQR បានទេ។ សូមព្យាយាមម្តងទៀត។')}
                      </p>
                    </div>
                  </div>
                )}

                {(khqrStatus === 'error' || khqrStatus === 'expired' || khqrStatus === 'setup_required') && (
                  <button type="button" onClick={createKhqrPayment} className="btn-secondary mt-4 h-11 w-full text-sm">
                    <QrCode className="size-4" aria-hidden="true" />
                    {t('Refresh KHQR', 'បង្កើត KHQR ម្តងទៀត')}
                  </button>
                )}
                </div>
              </div>
              )
            ) : (
              <>
                <p className="mt-4 text-sm leading-6 text-gray-500">{t('Checkout continues in Telegram. You can review and send the prepared message there.', 'ការបញ្ជាទិញនឹងបន្តនៅក្នុង Telegram។ អ្នកអាចពិនិត្យ និងផ្ញើសារដែលបានរៀបចំនៅទីនោះ។')}</p>
                <button type="button" onClick={handleOrder} className="btn-primary mt-5 h-12 w-full text-sm">
                  <MessageCircle className="size-4" aria-hidden="true" />
                  {t('Send through Telegram', 'ផ្ញើតាម Telegram')}
                </button>
              </>
            )}
            <button type="button" onClick={() => setShowConfirm(false)} className="mt-2 h-11 w-full rounded-xl text-sm font-bold text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-800 focus-ring">{t('Cancel', 'បោះបង់')}</button>
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
