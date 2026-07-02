'use client'

import { FormEvent, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, MessageCircle, Search, ShoppingBag, X } from 'lucide-react'
import { useApp } from '@/components/app-context'

const HEADER_CATEGORIES = [
  'Access Control',
  'Accessories',
  'Alarm System',
  'Attendance',
  'Audio / PA System',
  'CCTV',
  'Cabinet',
  'Network',
  'Smart Lock',
]

const TELEGRAM_URL = 'https://t.me/SANGHAMEUK'

export function Header() {
  const { lang, setLang, currency, setCurrency, t } = useApp()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [scrolled, setScrolled] = useState(false)
  const [activeCategory, setActiveCategory] = useState('')
  const drawerRef = useRef<HTMLDivElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)

  const navCategories = HEADER_CATEGORIES.slice(0, 6)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 6)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setActiveCategory(new URLSearchParams(window.location.search).get('category') || '')
  }, [pathname])

  useEffect(() => {
    if (!mobileOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const focusableSelector = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    const focusable = () => Array.from(drawerRef.current?.querySelectorAll<HTMLElement>(focusableSelector) || [])
    const first = focusable()[0]
    first?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileOpen(false)
        return
      }
      if (event.key !== 'Tab') return
      const items = focusable()
      if (!items.length) return
      const firstItem = items[0]
      const lastItem = items[items.length - 1]
      if (event.shiftKey && document.activeElement === firstItem) {
        event.preventDefault()
        lastItem.focus()
      } else if (!event.shiftKey && document.activeElement === lastItem) {
        event.preventDefault()
        firstItem.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
      menuButtonRef.current?.focus()
    }
  }, [mobileOpen])

  const closeMobile = () => setMobileOpen(false)

  const handleSearch = (event: FormEvent) => {
    event.preventDefault()
    const term = searchQuery.trim()
    if (!term) return
    window.location.href = `/products?search=${encodeURIComponent(term)}`
    setSearchOpen(false)
    closeMobile()
  }

  return (
    <>
      <header className={`sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b transition-shadow duration-300 ${scrolled ? 'border-gray-200 shadow-md' : 'border-gray-100 shadow-sm'}`}>
        <div className="container-page">
          <div className="flex items-center justify-between gap-3 h-14 sm:h-16">
            <Link href="/" className="flex items-center gap-2.5 shrink-0 rounded-xl focus-ring" aria-label="Vlaser Store home">
              <img src="/vlaser-logo.png" alt="Vlaser" className="h-8 sm:h-9 w-auto object-contain" />
              <span className="hidden sm:block text-base font-extrabold tracking-tight text-gray-950">
                Vlaser <span className="text-[var(--color-primary)]">Store</span>
              </span>
            </Link>

            <nav className="hidden xl:flex items-center gap-1" aria-label="Primary categories">
              {navCategories.map(cat => {
                const active = pathname === '/products' && activeCategory === cat
                return (
                  <Link
                    key={cat}
                    href={`/products?category=${encodeURIComponent(cat)}`}
                    className={`px-3 py-2 text-sm rounded-xl transition-colors focus-ring ${active ? 'bg-[var(--color-primary-lighter)] text-[var(--color-primary)] font-semibold' : 'text-gray-600 hover:text-gray-950 hover:bg-gray-50'}`}
                  >
                    {cat}
                  </Link>
                )
              })}
            </nav>

            <form onSubmit={handleSearch} className="hidden lg:block flex-1 max-w-xs">
              <label className="sr-only" htmlFor="site-search">{t('Search products', 'ស្វែងរកផលិតផល')}</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" aria-hidden="true" />
                <input
                  id="site-search"
                  type="search"
                  value={searchQuery}
                  onChange={event => setSearchQuery(event.target.value)}
                  placeholder={t('Search products, brands, SKU...', 'ស្វែងរកផលិតផល ម៉ាក ឬ SKU...')}
                  className="input-field h-10 pl-9 pr-3"
                />
              </div>
            </form>

            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => setSearchOpen(open => !open)}
                className="lg:hidden tap-target inline-flex items-center justify-center rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-950 transition-colors focus-ring"
                aria-label={t('Search', 'ស្វែងរក')}
                aria-expanded={searchOpen}
              >
                <Search className="size-5" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={() => setLang(lang === 'en' ? 'km' : 'en')}
                className="tap-target inline-flex items-center justify-center rounded-xl border border-gray-200 px-2.5 text-xs font-bold text-gray-700 hover:border-gray-300 hover:bg-gray-50 focus-ring"
                title={lang === 'en' ? 'ប្តូរទៅខ្មែរ' : 'Switch to English'}
              >
                {lang === 'en' ? 'ខ្មែរ' : 'EN'}
              </button>

              <button
                type="button"
                onClick={() => setCurrency(currency === 'USD' ? 'KHR' : 'USD')}
                className="tap-target hidden sm:inline-flex items-center justify-center rounded-xl border border-gray-200 px-2.5 text-xs font-bold text-gray-700 hover:border-gray-300 hover:bg-gray-50 focus-ring"
                title={currency === 'USD' ? 'Show KHR' : 'Show USD'}
              >
                {currency === 'USD' ? '៛' : '$'}
              </button>

              <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer" className="hidden md:inline-flex btn-secondary h-10 px-3 text-xs">
                <MessageCircle className="size-4" aria-hidden="true" />
                {t('Contact Sales', 'ទាក់ទងផ្នែកលក់')}
              </a>

              <Link href="/products" className="hidden sm:inline-flex btn-primary h-10 px-4 text-xs">
                <ShoppingBag className="size-4" aria-hidden="true" />
                {t('Shop', 'ទិញ')}
              </Link>

              <button
                ref={menuButtonRef}
                type="button"
                onClick={() => setMobileOpen(true)}
                className="xl:hidden tap-target inline-flex items-center justify-center rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-950 transition-colors focus-ring"
                aria-label={t('Open menu', 'បើកម៉ឺនុយ')}
                aria-expanded={mobileOpen}
              >
                <Menu className="size-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        {searchOpen && (
          <div className="lg:hidden border-t border-gray-100 bg-white animate-slide-down">
            <form onSubmit={handleSearch} className="container-page py-3">
              <label className="sr-only" htmlFor="mobile-site-search">{t('Search products', 'ស្វែងរកផលិតផល')}</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" aria-hidden="true" />
                <input
                  id="mobile-site-search"
                  type="search"
                  value={searchQuery}
                  onChange={event => setSearchQuery(event.target.value)}
                  autoFocus
                  placeholder={t('Search products, brands, SKU...', 'ស្វែងរកផលិតផល ម៉ាក ឬ SKU...')}
                  className="input-field pl-10 pr-24"
                />
                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 btn-primary h-8 px-3 text-xs">
                  {t('Search', 'ស្វែងរក')}
                </button>
              </div>
            </form>
          </div>
        )}
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-[100] xl:hidden" role="dialog" aria-modal="true" aria-label={t('Mobile navigation', 'ម៉ឺនុយទូរស័ព្ទ')}>
          <button type="button" className="absolute inset-0 bg-black/35 backdrop-blur-[2px] animate-fade-in" onClick={closeMobile} aria-label={t('Close menu overlay', 'បិទម៉ឺនុយ')} />
          <div ref={drawerRef} className="absolute right-0 top-0 bottom-0 flex w-[min(88vw,360px)] flex-col bg-white shadow-xl animate-drawer-in">
            <div className="flex items-center justify-between gap-3 border-b border-gray-100 p-4">
              <Link href="/" onClick={closeMobile} className="flex items-center gap-2 rounded-xl focus-ring">
                <img src="/vlaser-logo.png" alt="Vlaser" className="h-8 w-auto object-contain" />
                <span className="text-sm font-extrabold text-gray-950">Vlaser <span className="text-[var(--color-primary)]">Store</span></span>
              </Link>
              <button type="button" onClick={closeMobile} className="tap-target inline-flex items-center justify-center rounded-xl text-gray-500 hover:bg-gray-50 hover:text-gray-950 focus-ring" aria-label={t('Close menu', 'បិទម៉ឺនុយ')}>
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>

            <div className="overflow-y-auto p-4">
              <form onSubmit={handleSearch} className="mb-4">
                <label className="sr-only" htmlFor="drawer-search">{t('Search products', 'ស្វែងរកផលិតផល')}</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" aria-hidden="true" />
                  <input id="drawer-search" type="search" value={searchQuery} onChange={event => setSearchQuery(event.target.value)} placeholder={t('Search store', 'ស្វែងរក')} className="input-field pl-9" />
                </div>
              </form>

              <nav className="space-y-1" aria-label="Mobile categories">
                <Link href="/products" onClick={closeMobile} className="flex min-h-11 items-center rounded-xl px-3 text-sm font-semibold text-gray-950 hover:bg-gray-50 focus-ring">
                  {t('All Products', 'ផលិតផលទាំងអស់')}
                </Link>
                {HEADER_CATEGORIES.map((cat, index) => (
                  <Link
                    key={cat}
                    href={`/products?category=${encodeURIComponent(cat)}`}
                    onClick={closeMobile}
                    className={`flex min-h-11 items-center rounded-xl px-3 text-sm transition-colors focus-ring ${activeCategory === cat ? 'bg-[var(--color-primary-lighter)] text-[var(--color-primary)] font-semibold' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-950'}`}
                    style={{ animationDelay: `${index * 18}ms` }}
                  >
                    {cat}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="mt-auto border-t border-gray-100 p-4 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setLang(lang === 'en' ? 'km' : 'en')} className="btn-secondary h-11 px-3 text-xs">
                  {lang === 'en' ? 'ខ្មែរ' : 'English'}
                </button>
                <button type="button" onClick={() => setCurrency(currency === 'USD' ? 'KHR' : 'USD')} className="btn-secondary h-11 px-3 text-xs">
                  {currency === 'USD' ? 'KHR ៛' : 'USD $'}
                </button>
              </div>
              <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer" className="btn-primary w-full h-11 text-sm">
                <MessageCircle className="size-4" aria-hidden="true" />
                {t('Contact Sales', 'ទាក់ទងផ្នែកលក់')}
              </a>
              <Link href="/products" onClick={closeMobile} className="btn-secondary w-full h-11 text-sm">
                <ShoppingBag className="size-4" aria-hidden="true" />
                {t('Shop Products', 'ទិញផលិតផល')}
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
