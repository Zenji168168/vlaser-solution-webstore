'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { products, CATEGORIES } from '@/lib/products-data'

export default function Page() {
  const [isVisible, setIsVisible] = useState(false)
  useEffect(() => { setIsVisible(true) }, [])

  const categoryCounts = CATEGORIES.filter(c => c !== 'All').map(c => ({
    name: c,
    count: products.filter(p => p.category === c).length,
    icon: c === 'CCTV' ? '📹' : c === 'Access Control' ? '🔐' : c === 'Network' ? '🌐' : c === 'Alarm System' ? '🚨' : c === 'Attendance' ? '⏰' : c === 'Accessories' ? '🔧' : c === 'Audio / PA System' ? '🔊' : c === 'Cabinet' ? '🗄️' : c === 'Smart Lock' ? '🔒' : '📦'
  }))

  const featuredProducts = products.filter(p => p.price > 100 && p.price < 500).slice(0, 8)

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-xl bg-background/90 border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3">
            <img src="/vlaser-logo.svg" alt="Vlaser" className="h-10" />
          </Link>
          <div className="hidden md:flex gap-8 items-center">
            <Link href="/products" className="text-sm font-medium hover:text-primary transition-colors">Products</Link>
            <Link href="/products?category=CCTV" className="text-sm font-medium hover:text-primary transition-colors">CCTV</Link>
            <Link href="/products?category=Network" className="text-sm font-medium hover:text-primary transition-colors">Network</Link>
            <Link href="/products?category=Access+Control" className="text-sm font-medium hover:text-primary transition-colors">Access Control</Link>
            <Link href="/products" className="px-5 py-2 bg-primary text-primary-foreground rounded-lg font-semibold text-sm hover:bg-primary/90 transition-all hover:scale-105">
              Shop All
            </Link>
          </div>
          <Link href="/products" className="md:hidden px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold text-sm">
            Shop
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 left-1/4 w-[500px] h-[500px] bg-primary/8 rounded-full blur-3xl animate-float" />
          <div className="absolute -bottom-40 right-1/4 w-[400px] h-[400px] bg-secondary/8 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto text-center">
          <div className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="inline-block mb-6 px-4 py-2 rounded-full bg-primary/10 border border-primary/30">
              <span className="text-primary text-xs font-bold uppercase tracking-widest">Professional Security & Technology Solutions</span>
            </div>
          </div>

          <h1 className={`text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-[0.9] transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <span className="text-foreground">Security</span>{' '}
            <span className="bg-gradient-to-r from-primary via-[#A04550] to-secondary bg-clip-text text-transparent">Solutions</span>
            <br />
            <span className="text-foreground text-4xl md:text-5xl lg:text-6xl">You Can Trust</span>
          </h1>

          <p className={`text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            CCTV, Network, Access Control, Alarm Systems & more from world-class brands. Serving Cambodia and Southeast Asia.
          </p>

          <div className={`flex gap-4 justify-center flex-wrap transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <Link href="/products" className="px-8 py-4 bg-primary text-primary-foreground rounded-xl font-bold text-lg hover:bg-primary/90 transition-all hover:scale-105 hover:shadow-xl hover:shadow-primary/30">
              Browse {products.length}+ Products
            </Link>
            <a href="https://wa.me/85512345678" target="_blank" rel="noopener noreferrer" className="px-8 py-4 border-2 border-secondary/60 text-secondary rounded-xl font-bold text-lg hover:bg-secondary/10 hover:border-secondary transition-all hover:scale-105">
              Contact Sales
            </a>
          </div>

          {/* Brand Logos */}
          <div className={`mt-16 transition-all duration-700 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <p className="text-xs text-muted-foreground/60 uppercase tracking-widest mb-4">Authorized Distributor</p>
            <div className="flex items-center justify-center gap-8 flex-wrap opacity-60">
              {['Hikvision', 'UNV', 'ZKTeco', 'EZVIZ', 'HUAWEI', 'ITC'].map((b) => (
                <span key={b} className="text-sm font-bold text-muted-foreground/80 hover:text-primary transition-colors cursor-default">{b}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-card/30 border-y border-border/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black mb-3">Shop by Category</h2>
            <p className="text-muted-foreground">Find the right solution for your security needs</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {categoryCounts.map((cat) => (
              <Link key={cat.name} href={`/products?category=${encodeURIComponent(cat.name)}`}
                className="group bg-card/60 border border-border/50 hover:border-primary/60 rounded-xl p-5 text-center transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1">
                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">{cat.icon}</div>
                <h3 className="font-bold text-sm mb-1 group-hover:text-primary transition-colors">{cat.name}</h3>
                <p className="text-xs text-muted-foreground">{cat.count} products</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-black mb-2">Featured Products</h2>
              <p className="text-muted-foreground">Popular security solutions at competitive prices</p>
            </div>
            <Link href="/products" className="hidden md:inline-flex px-5 py-2.5 border border-primary/50 text-primary rounded-lg font-semibold text-sm hover:bg-primary/10 transition-all">
              View All &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <Link key={product.id} href={`/products/${product.id}`} className="group">
                <div className="bg-card/60 border border-border/40 hover:border-primary/50 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 h-full flex flex-col">
                  <div className="h-44 bg-gradient-to-br from-card to-muted/30 flex items-center justify-center overflow-hidden">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                  </div>
                  <div className="p-4 flex-grow flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-bold text-secondary uppercase">{product.brand}</span>
                      <span className="text-[10px] text-muted-foreground">|</span>
                      <span className="text-[10px] text-muted-foreground">{product.category}</span>
                    </div>
                    <h3 className="font-semibold text-sm mb-1 line-clamp-2 group-hover:text-primary transition-colors">{product.name}</h3>
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2 flex-grow">{product.description}</p>
                    <div className="flex items-center justify-between pt-3 border-t border-border/30">
                      <span className="text-xl font-black text-primary">${product.price.toFixed(2)}</span>
                      <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded font-semibold group-hover:bg-primary group-hover:text-primary-foreground transition-all">View</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8 md:hidden">
            <Link href="/products" className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold">
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary/10 via-card/50 to-secondary/10 border-y border-border/30">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { num: '141+', label: 'Products Listed' },
            { num: '10+', label: 'Global Brands' },
            { num: '10+', label: 'Categories' },
            { num: '24/7', label: 'Support Available' },
          ].map((s, i) => (
            <div key={i} className="group">
              <div className="text-3xl md:text-4xl font-black text-primary group-hover:text-secondary transition-colors">{s.num}</div>
              <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-black mb-6">Ready to Secure Your Business?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Get professional consultation and competitive pricing on enterprise security solutions.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/products" className="px-8 py-4 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-all hover:scale-105">
              Browse Products
            </Link>
            <a href="https://wa.me/85512345678" target="_blank" rel="noopener noreferrer" className="px-8 py-4 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all hover:scale-105">
              WhatsApp Us
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-border/50 bg-card/30">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <img src="/vlaser-logo.svg" alt="Vlaser" className="h-8 mb-3" />
            <p className="text-xs text-muted-foreground leading-relaxed">Technology Service Provider. Professional security solutions for businesses in Cambodia & Southeast Asia.</p>
          </div>
          <div>
            <h4 className="font-bold text-sm mb-3">Products</h4>
            <div className="space-y-2">
              {['CCTV', 'Network', 'Access Control', 'Smart Lock'].map(c => (
                <Link key={c} href={`/products?category=${encodeURIComponent(c)}`} className="block text-xs text-muted-foreground hover:text-primary transition-colors">{c}</Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-bold text-sm mb-3">Brands</h4>
            <div className="space-y-2">
              {['Hikvision', 'UNV', 'ZKTeco', 'HUAWEI', 'EZVIZ'].map(b => (
                <Link key={b} href={`/products?brand=${encodeURIComponent(b)}`} className="block text-xs text-muted-foreground hover:text-primary transition-colors">{b}</Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-bold text-sm mb-3">Contact</h4>
            <div className="space-y-2 text-xs text-muted-foreground">
              <p>WhatsApp: +855 12 345 678</p>
              <p>Email: info@vlasersolution.com</p>
              <p>Phnom Penh, Cambodia</p>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-border/30 text-center text-xs text-muted-foreground">
          &copy; 2026 Vlaser Solution. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
