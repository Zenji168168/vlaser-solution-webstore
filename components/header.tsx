'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useApp } from '@/components/app-context'
import { CATEGORIES } from '@/lib/products-data'

export function Header() {
  const { lang, setLang, currency, setCurrency, t } = useApp()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const navCategories = CATEGORIES.filter(c => c !== 'All' && c !== 'Other').slice(0, 6)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery.trim())}`
      setSearchOpen(false)
    }
  }

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="container-page">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <img src="/vlaser-logo.png" alt="Vlaser" className="h-8 sm:h-9 w-auto object-contain" />
              <span className="hidden sm:block text-base font-bold text-gray-900">
                Vlaser <span className="text-[var(--color-primary)]">Store</span>
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {navCategories.slice(0, 5).map(cat => (
                <Link key={cat} href={`/products?category=${encodeURIComponent(cat)}`}
                  className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                  {cat}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Search toggle */}
              <button onClick={() => setSearchOpen(!searchOpen)} className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors" aria-label="Search">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              </button>

              {/* Lang toggle */}
              <button onClick={() => setLang(lang === 'en' ? 'km' : 'en')}
                className="px-2 py-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 border border-gray-200 hover:border-gray-300 rounded-md transition-all"
                title={lang === 'en' ? 'ប្តូរទៅខ្មែរ' : 'Switch to English'}>
                {lang === 'en' ? 'ខ្មែរ' : 'EN'}
              </button>

              {/* Currency toggle */}
              <button onClick={() => setCurrency(currency === 'USD' ? 'KHR' : 'USD')}
                className="px-2 py-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 border border-gray-200 hover:border-gray-300 rounded-md transition-all">
                {currency === 'USD' ? '៛' : '$'}
              </button>

              {/* CTA */}
              <Link href="/products" className="hidden sm:inline-flex btn-primary text-xs px-4 py-2">
                {t('Shop','ទិញ')}
              </Link>

              {/* Mobile menu */}
              <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 text-gray-500 hover:text-gray-900 rounded-lg" aria-label="Menu">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16"/></svg>
              </button>
            </div>
          </div>
        </div>

        {/* Search bar */}
        {searchOpen && (
          <div className="border-t border-gray-100 bg-white animate-slide-down">
            <form onSubmit={handleSearch} className="container-page py-3">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} autoFocus
                  placeholder={t('Search products, brands, SKU...','ស្វែងរកផលិតផល ម៉ាក SKU...')}
                  className="input-field pl-10 pr-20" />
                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 btn-primary text-xs px-3 py-1.5">{t('Search','ស្វែងរក')}</button>
              </div>
            </form>
          </div>
        )}
      </header>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-[280px] bg-white shadow-xl animate-fade-in overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <span className="font-bold text-sm">Vlaser Store</span>
              <button onClick={() => setMobileOpen(false)} className="p-1 text-gray-500 hover:text-gray-900 rounded" aria-label="Close">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <nav className="p-4 space-y-1">
              <Link href="/products" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-50 rounded-lg">{t('All Products','ផលិតផលទាំងអស់')}</Link>
              {navCategories.map(cat => (
                <Link key={cat} href={`/products?category=${encodeURIComponent(cat)}`} onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg">{cat}</Link>
              ))}
            </nav>
            <div className="p-4 border-t border-gray-100 space-y-3">
              <a href="https://t.me/SANGHAMEUK" target="_blank" rel="noopener noreferrer" className="block w-full text-center py-2.5 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50">
                ✈️ {t('Telegram','តេឡេក្រាម')}
              </a>
              <a href="tel:096666954" className="block w-full text-center py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50">
                📞 096 666 9545
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
