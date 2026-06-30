'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { products, CATEGORIES } from '@/lib/products-data'

function useInView(ref: React.RefObject<HTMLElement | null>) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.1 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [ref])
  return visible
}

export default function Page() {
  const heroRef = useRef<HTMLDivElement>(null)
  const catRef = useRef<HTMLDivElement>(null)
  const featRef = useRef<HTMLDivElement>(null)
  const heroVis = useInView(heroRef)
  const catVis = useInView(catRef)
  const featVis = useInView(featRef)

  const categoryCounts = CATEGORIES.filter(c => c !== 'All').map(c => ({
    name: c, count: products.filter(p => p.category === c).length,
    icon: c==='CCTV'?'📹':c==='Access Control'?'🔐':c==='Network'?'🌐':c==='Alarm System'?'🚨':c==='Attendance'?'⏰':c==='Accessories'?'🔧':c==='Audio / PA System'?'🔊':c==='Cabinet'?'🗄️':c==='Smart Lock'?'🔒':'📦'
  }))

  const featured = products.filter(p => p.price >= 40 && p.price <= 350 && p.image.startsWith('http')).slice(0, 8)
  const topBrands = ['Hikvision','UNV','ZKTeco','EZVIZ','HUAWEI','Watashi','ITC','Toten','ruijie','NGTeco']

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-lg border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-red-900 to-red-800 flex items-center justify-center text-white font-black text-sm group-hover:scale-105 transition-transform">V</div>
            <div>
              <span className="text-base font-bold tracking-tight">VLASER</span>
              <span className="hidden sm:inline text-[10px] text-muted-foreground ml-2 uppercase tracking-widest">Technology Service Provider</span>
            </div>
          </Link>
          <div className="flex items-center gap-1">
            <Link href="/products" className="hidden md:inline-flex px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted/50">All Products</Link>
            <Link href="/products?category=CCTV" className="hidden lg:inline-flex px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted/50">CCTV</Link>
            <Link href="/products?category=Network" className="hidden lg:inline-flex px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted/50">Network</Link>
            <Link href="/products" className="ml-2 px-4 py-2 bg-red-900 hover:bg-red-800 text-white text-sm font-semibold rounded-lg transition-all hover:shadow-lg hover:shadow-red-900/20">
              Shop Now
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section ref={heroRef} className="pt-32 pb-24 px-4 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-red-950/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-amber-950/10 rounded-full blur-[100px]" />
        </div>
        <div className={`relative max-w-5xl mx-auto text-center transition-all duration-1000 ${heroVis ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-red-900/40 bg-red-950/20 text-red-400 text-xs font-medium mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            1,382 Products Available
          </div>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05] mb-6">
            Professional<br/>
            <span className="bg-gradient-to-r from-red-500 via-red-400 to-amber-500 bg-clip-text text-transparent">Security Technology</span><br/>
            <span className="text-muted-foreground text-3xl sm:text-4xl lg:text-5xl font-bold">for Modern Business</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
            Enterprise CCTV, network infrastructure, access control & smart solutions from the world's leading brands.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link href="/products" className="px-7 py-3.5 bg-red-900 hover:bg-red-800 text-white font-semibold rounded-xl transition-all hover:shadow-xl hover:shadow-red-900/30 hover:-translate-y-0.5 text-sm">
              Browse All Products →
            </Link>
            <a href="https://wa.me/85512345678" target="_blank" rel="noopener noreferrer" className="px-7 py-3.5 border border-border hover:border-green-800 text-foreground hover:text-green-400 font-semibold rounded-xl transition-all hover:bg-green-950/20 text-sm">
              💬 WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* Brand Marquee */}
      <section className="border-y border-border/40 py-5 overflow-hidden bg-card/30">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...topBrands, ...topBrands, ...topBrands].map((b, i) => (
            <span key={i} className="mx-8 text-sm font-semibold text-muted-foreground/50 hover:text-foreground transition-colors cursor-default">{b}</span>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section ref={catRef} className="py-20 px-4 lg:px-8">
        <div className={`max-w-7xl mx-auto transition-all duration-700 ${catVis ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Categories</h2>
              <p className="text-sm text-muted-foreground mt-1">Browse by solution type</p>
            </div>
            <Link href="/products" className="text-sm text-red-400 hover:text-red-300 font-medium hidden sm:inline">View all →</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 stagger">
            {categoryCounts.map((cat) => (
              <Link key={cat.name} href={`/products?category=${encodeURIComponent(cat.name)}`}
                className="fade-up group relative bg-card border border-border/60 hover:border-red-900/60 rounded-2xl p-5 transition-all duration-300 hover:shadow-lg hover:shadow-red-950/10 hover:-translate-y-1 overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-red-950/10 to-transparent rounded-bl-full" />
                <span className="text-2xl block mb-3">{cat.icon}</span>
                <h3 className="font-semibold text-sm group-hover:text-red-400 transition-colors">{cat.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{cat.count} items</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured */}
      <section ref={featRef} className="py-20 px-4 lg:px-8 bg-card/20">
        <div className={`max-w-7xl mx-auto transition-all duration-700 ${featVis ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Featured Products</h2>
              <p className="text-sm text-muted-foreground mt-1">Hand-picked selections from our catalog</p>
            </div>
            <Link href="/products" className="text-sm text-red-400 hover:text-red-300 font-medium hidden sm:inline">View all →</Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger">
            {featured.map((p) => (
              <Link key={p.id} href={`/products/${p.id}`} className="fade-up">
                <div className="product-card bg-card border border-border/50 rounded-2xl overflow-hidden h-full flex flex-col group">
                  <div className="aspect-[4/3] bg-muted/30 overflow-hidden relative">
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="p-4 flex-grow flex flex-col">
                    <span className="text-[10px] font-semibold text-amber-500 uppercase tracking-wider">{p.brand}</span>
                    <h3 className="font-medium text-sm mt-1 line-clamp-2 leading-snug group-hover:text-red-400 transition-colors">{p.name}</h3>
                    <div className="mt-auto pt-3">
                      <span className="text-lg font-bold">${p.price.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-4 lg:px-8 border-y border-border/40">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[{n:'1,382',l:'Products'},{n:'15',l:'Brands'},{n:'10',l:'Categories'},{n:'24/7',l:'Support'}].map((s,i) => (
            <div key={i}>
              <div className="text-2xl sm:text-3xl font-black text-red-400">{s.n}</div>
              <div className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Need a Custom Quote?</h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">Get competitive pricing on bulk orders, project installations, and enterprise solutions.</p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <a href="https://wa.me/85512345678" target="_blank" rel="noopener noreferrer" className="px-6 py-3 bg-green-700 hover:bg-green-600 text-white font-semibold rounded-xl transition-all text-sm">
              WhatsApp Sales Team
            </a>
            <a href="mailto:info@vlasersolution.com" className="px-6 py-3 border border-border hover:border-muted-foreground text-foreground font-semibold rounded-xl transition-all text-sm">
              Email Us
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-card/30 py-12 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-md bg-red-900 flex items-center justify-center text-white font-black text-xs">V</div>
              <span className="font-bold text-sm">VLASER</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">Technology Service Provider<br/>Phnom Penh, Cambodia</p>
          </div>
          <div>
            <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-3">Shop</h4>
            <div className="space-y-2">{['CCTV','Network','Access Control','Smart Lock','Attendance'].map(c=>(
              <Link key={c} href={`/products?category=${encodeURIComponent(c)}`} className="block text-xs text-muted-foreground hover:text-foreground transition-colors">{c}</Link>
            ))}</div>
          </div>
          <div>
            <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-3">Brands</h4>
            <div className="space-y-2">{['Hikvision','UNV','ZKTeco','HUAWEI','EZVIZ'].map(b=>(
              <Link key={b} href={`/products?brand=${encodeURIComponent(b)}`} className="block text-xs text-muted-foreground hover:text-foreground transition-colors">{b}</Link>
            ))}</div>
          </div>
          <div>
            <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-3">Contact</h4>
            <div className="space-y-2 text-xs text-muted-foreground">
              <p>+855 12 345 678</p>
              <p>info@vlasersolution.com</p>
              <p>store.vlasersolution.com</p>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-6 border-t border-border/30 flex items-center justify-between">
          <p className="text-[10px] text-muted-foreground">&copy; 2026 Vlaser Solution. All rights reserved.</p>
          <p className="text-[10px] text-muted-foreground">Built with Next.js</p>
        </div>
      </footer>
    </div>
  )
}
